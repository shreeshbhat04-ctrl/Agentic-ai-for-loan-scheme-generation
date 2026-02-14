import uvicorn
import httpx
import logging
import json
import re
import asyncio
import os
import io
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import google.generativeai as genai
from typing import Optional, Union

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === TESSERACT CONFIG ===
tesseract_cmd = os.getenv("TESSERACT_CMD", 'C:/Program Files/Tesseract-OCR/tesseract.exe')
if os.path.exists(tesseract_cmd):
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    logger.info(f"Tesseract found: {tesseract_cmd}")
else:
    logger.error(f"Tesseract NOT found at: {tesseract_cmd}")

# === DATABASE CONFIG ===
DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME", "loan_chatbot_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

# === GEMINI CONFIG ===
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("Gemini API configured")
else:
    logger.warning("GOOGLE_API_KEY not set; Gemini calls will be skipped.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Document Processor starting")
    yield
    logger.info("Document Processor shutting down")


app = FastAPI(title="Document Processing Agent", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # or restrict to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === PYDANTIC MODELS ===
class ProcessRequest(BaseModel):
    file_path: str


class KYCExtractionResult(BaseModel):
    name: Optional[str] = Field(None, description="Full name")
    aadhaar_number: Optional[str] = Field(None, description="Aadhaar number")
    pan_number: Optional[str] = Field(None, description="PAN number")
    date_of_birth: Optional[str] = Field(None, description="DOB (YYYY-MM-DD)")
    address: Optional[str] = Field(None, description="Address")


class SalaryExtractionResult(BaseModel):
    # Allow both int and str, we normalize later
    monthly_salary: Optional[Union[int, str]] = Field(None, description="Net monthly salary")
    salary_source: Optional[str] = Field(None, description="Company name or source")
    document_type: Optional[str] = Field(None, description="Salary slip, bank statement, etc")
    confidence: Optional[float] = Field(None, description="Extraction confidence 0-1")


class VerificationResult(BaseModel):
    status: str  # "verified", "manual_review" or "failed"
    monthly_salary: Optional[int]
    salary_source: Optional[str]
    document_type: Optional[str]
    confidence: Optional[float]
    error: Optional[str]


# === HELPER FUNCTIONS ===
def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except psycopg2.Error as e:
        logger.error(f"DB connection error: {e}")
        return None


async def extract_text_from_file(file_path: str) -> Optional[str]:
    """
    Extract text from PDF or image using hybrid approach:
    1. Try native text extraction (fast)
    2. Fall back to OCR if text yield is low (thorough)
    """
    script_dir = os.path.dirname(__file__)
    base_dir = os.path.abspath(os.path.join(script_dir, '..', '..'))
    full_path = file_path

    if not os.path.isabs(file_path):
        full_path = os.path.join(base_dir, file_path)

    logger.info(f"Extracting text from: {full_path}")

    if not os.path.exists(full_path):
        logger.error(f"File not found: {full_path}")
        return None

    extracted_text = ""
    file_ext = os.path.splitext(full_path)[1].lower()

    try:
        if file_ext == ".pdf":
            doc = fitz.open(full_path)
            total_pages = len(doc)
            logger.info(f"Processing PDF: {total_pages} pages")

            for page_num in range(total_pages):
                page = doc.load_page(page_num)

                # Step 1: Native text
                page_text = page.get_text("text")
                extracted_text += page_text + "\n\n"

                # Step 2: Fallback OCR if needed
                text_length = len(page_text.strip())
                if text_length < 100:
                    logger.info(f"Page {page_num + 1}: Low text yield ({text_length} chars), attempting OCR")

                    try:
                        pix = page.get_pixmap(dpi=300, alpha=False)
                        img_bytes = pix.tobytes("png")
                        img = Image.open(io.BytesIO(img_bytes))

                        loop = asyncio.get_running_loop()
                        ocr_text = await loop.run_in_executor(None, pytesseract.image_to_string, img)

                        if ocr_text and len(ocr_text.strip()) > 50:
                            extracted_text += "=== OCR EXTRACTED ===\n" + ocr_text + "\n\n"
                            logger.info(f"Page {page_num + 1}: OCR successful ({len(ocr_text)} chars)")
                        else:
                            logger.warning(f"Page {page_num + 1}: OCR yielded minimal text")
                    except Exception as ocr_err:
                        logger.warning(f"Page {page_num + 1}: OCR failed - {ocr_err}")

            doc.close()

        elif file_ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
            logger.info(f"Processing image file: {file_ext}")
            img = Image.open(full_path)

            try:
                loop = asyncio.get_running_loop()
                extracted_text = await loop.run_in_executor(None, pytesseract.image_to_string, img)
                logger.info(f"Image OCR successful ({len(extracted_text)} chars)")
            except Exception as ocr_err:
                logger.error(f"Image OCR failed: {ocr_err}")
                return None
        else:
            logger.warning(f"Unsupported file type: {file_ext}")
            return None

        if extracted_text and len(extracted_text.strip()) > 20:
            logger.info(f"Text extraction complete: {len(extracted_text)} chars")
            return extracted_text
        else:
            logger.warning(f"No text extracted from {file_path}")
            return None

    except Exception as e:
        logger.error(f"Text extraction error: {e}", exc_info=True)
        return None


async def call_gemini_for_extraction(
    text_content: str,
    schema: type[BaseModel],
    extraction_type: str = "general"
) -> Optional[dict]:
    """Call Gemini with specific prompts for different extraction types"""
    if not GOOGLE_API_KEY or not text_content:
        logger.warning("Gemini not configured or empty text; skipping extraction.")
        return None

    model_name = 'gemini-2.5-flash'

    if extraction_type == "salary":
        prompt = f"""
        Analyze this salary document/slip and extract salary information.
        IMPORTANT: Be very precise - this is for loan verification.
        
        Look for:
        - Monthly net salary (after deductions)
        - Gross salary if net is unavailable
        - Company/employer name
        - Document type (salary slip, bank statement, offer letter, etc)
        
        Respond ONLY with valid JSON matching this structure: {schema.model_json_schema()}
        If you cannot find a value with high confidence, use null.
        Add a "confidence" field (0-1) for the salary amount.
        
        DOCUMENT:
        ---
        {text_content[:10000]}
        ---
        """
    else:
        prompt = f"""
        Extract information from this document.
        Respond ONLY with valid JSON matching: {schema.model_json_schema()}
        Use null for missing fields.
        
        DOCUMENT:
        ---
        {text_content[:8000]}
        ---
        """

    try:
        logger.info(f"Calling Gemini for {extraction_type} extraction")
        model = genai.GenerativeModel(model_name=model_name)
        response = await asyncio.to_thread(
            lambda: model.generate_content(prompt)
        )

        if response and hasattr(response, 'text') and response.text:
            raw_text = response.text.strip()

            match = re.search(r"```json\s*([\s\S]*?)\s*```", raw_text, re.DOTALL)
            json_text = match.group(1).strip() if match else raw_text if raw_text.startswith('{') else None

            if not json_text:
                logger.error(f"No JSON found. Raw: {raw_text[:200]}")
                return None

            result_json = json.loads(json_text)
            validated = schema.model_validate(result_json)
            logger.info(f"Extraction successful: {extraction_type}")
            return validated.model_dump()

        elif response and hasattr(response, 'prompt_feedback'):
            logger.warning(f"Gemini blocked response: {response.prompt_feedback}")
            return None
        else:
            logger.error(f"Unexpected response: {response}")
            return None

    except (json.JSONDecodeError, ValidationError) as e:
        logger.error(f"JSON/validation error: {e}")
        return None
    except Exception as e:
        logger.error(f"Gemini call error: {e}", exc_info=True)
        return None


def _sync_create_new_customer(data: dict) -> Optional[str]:
    """Create new customer in DB from KYC data"""
    conn = get_db_connection()
    if not conn:
        return None

    cursor = None
    try:
        cursor = conn.cursor()
        new_cust_id = f"NEW_{str(uuid.uuid4())[:8]}"

        name = data.get("name") or "Extracted Customer"
        phone = data.get("phone", "N/A")
        address = data.get("address", "N/A")
        credit_score = 650
        pre_approved_limit = 10000
        interest_options = ['12.0%']

        sql = """
        INSERT INTO customers (cust_id, name, phone, address, credit_score, pre_approved_limit, interest_options)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (cust_id) DO NOTHING
        RETURNING cust_id;
        """

        cursor.execute(
            sql,
            (new_cust_id, name, phone, address, credit_score, pre_approved_limit, interest_options)
        )
        result = cursor.fetchone()

        if result:
            conn.commit()
            logger.info(f"Customer created: {new_cust_id}")
            return new_cust_id
        else:
            logger.warning(f"Customer insert failed: {new_cust_id}")
            conn.rollback()
            return None

    except psycopg2.Error as e:
        logger.error(f"DB error: {e}")
        conn.rollback()
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# === API ENDPOINTS ===
@app.post("/process_kyc_doc")
async def process_kyc_document(request: ProcessRequest):
    """Extract KYC info from document and create customer"""
    file_path = request.file_path
    logger.info(f"Processing KYC document: {file_path}")

    extracted_text = await extract_text_from_file(file_path)
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract text from: {file_path}"
        )

    extracted_data = await call_gemini_for_extraction(
        extracted_text,
        KYCExtractionResult,
        "kyc"
    )
    if not extracted_data:
        raise HTTPException(status_code=500, detail="LLM extraction failed")

    loop = asyncio.get_running_loop()
    new_cust_id = await loop.run_in_executor(None, _sync_create_new_customer, extracted_data)

    if not new_cust_id:
        raise HTTPException(status_code=500, detail="DB creation failed")

    logger.info(f"KYC processed: {new_cust_id}")
    return {
        "status": "success",
        "customer_id": new_cust_id,
        "name": extracted_data.get("name"),
        "aadhaar": extracted_data.get("aadhaar_number"),
        "pan": extracted_data.get("pan_number")
    }


# === SALARY VERIFICATION CORE LOGIC ===
async def _verify_salary_from_path(file_path: str) -> VerificationResult:
    """
    Core logic to verify salary given a file path.
    Used by both JSON and upload endpoints.
    """
    logger.info(f"Verifying salary from: {file_path}")

    try:
        # 1) Extract text from the document
        extracted_text = await extract_text_from_file(file_path)
        if not extracted_text:
            return VerificationResult(
                status="failed",
                monthly_salary=None,
                salary_source=None,
                document_type=None,
                confidence=None,
                error="Could not extract text from document"
            )

        # 2) Try Gemini-based structured extraction
        extracted_data = await call_gemini_for_extraction(
            extracted_text,
            SalaryExtractionResult,
            "salary"
        )

        logger.info(f"Raw salary extraction from Gemini: {extracted_data}")

        # 3) Normalize salary from Gemini result (if any)
        salary: Optional[int] = None
        confidence: Optional[float] = None
        salary_source: Optional[str] = None
        document_type: Optional[str] = None

        if extracted_data:
            raw_salary = extracted_data.get("monthly_salary")
            salary_source = extracted_data.get("salary_source")
            document_type = extracted_data.get("document_type")
            confidence = extracted_data.get("confidence")

            if isinstance(raw_salary, str):
                # e.g. "₹ 7,50,000" or "750,000"
                digits = re.sub(r"[^\d]", "", raw_salary)
                if digits:
                    try:
                        salary = int(digits)
                    except ValueError:
                        salary = None
            elif isinstance(raw_salary, (int, float)):
                salary = int(raw_salary)

        # 4) FALLBACK: if salary still missing, parse directly from text
        if (not salary or salary <= 0) and extracted_text:
            logger.info("Gemini did not provide a salary. Falling back to regex parsing.")
            patterns = [
                r"Net Salary.*?₹\s*([\d,]+)",
                r"Net Salary.*?([\d,][\d,\,\.]*)",
                r"Net Salary \(In-Hand\).*?₹\s*([\d,]+)",
            ]

            for pat in patterns:
                m = re.search(pat, extracted_text, flags=re.IGNORECASE)
                if m:
                    digits = re.sub(r"[^\d]", "", m.group(1))
                    if digits:
                        try:
                            salary = int(digits)
                            logger.info(f"Regex fallback salary parsed as: {salary}")
                            break
                        except ValueError:
                            continue

        # 5) If still no valid salary, fail
        if not salary or salary <= 0:
            return VerificationResult(
                status="failed",
                monthly_salary=None,
                salary_source=salary_source,
                document_type=document_type,
                confidence=None,
                error="Invalid or missing salary amount"
            )

        # 6) Confidence handling
        if confidence is None:
            confidence = 0.85  # default if Gemini didn't provide one

        verification_status = "verified" if confidence >= 0.7 else "manual_review"

        logger.info(f"Salary verification complete: ₹{salary}, confidence={confidence}")

        return VerificationResult(
            status=verification_status,
            monthly_salary=salary,
            salary_source=salary_source,
            document_type=document_type,
            confidence=confidence,
            error=None
        )

    except Exception as e:
        logger.error(f"Salary verification error: {e}", exc_info=True)
        return VerificationResult(
            status="failed",
            monthly_salary=None,
            salary_source=None,
            document_type=None,
            confidence=None,
            error=str(e)
        )



@app.post("/verify_salary")
async def verify_salary_from_document(request: ProcessRequest) -> VerificationResult:
    """
    JSON-based endpoint, used by master agent.
    Expects: { "file_path": "/path/to/file.pdf" }
    """
    return await _verify_salary_from_path(request.file_path)


@app.post("/verify_salary_upload")
async def verify_salary_upload(file: UploadFile = File(...)) -> VerificationResult:
    """
    File upload endpoint, used by the frontend.
    Accepts multipart/form-data with a file under field name 'file'.
    """
    temp_path: Optional[str] = None

    try:
        contents = await file.read()

        _, ext = os.path.splitext(file.filename or "")
        if not ext:
            ext = ".pdf"

        temp_dir = os.path.join(os.getcwd(), "uploaded_docs")
        os.makedirs(temp_dir, exist_ok=True)

        temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}{ext}")
        with open(temp_path, "wb") as f:
            f.write(contents)

        logger.info(f"Uploaded file saved to: {temp_path}")

        return await _verify_salary_from_path(temp_path)

    except Exception as e:
        logger.error(f"verify_salary_upload error: {e}", exc_info=True)
        return VerificationResult(
            status="failed",
            monthly_salary=None,
            salary_source=None,
            document_type=None,
            confidence=None,
            error=str(e)
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                logger.info(f"Temp file removed: {temp_path}")
            except Exception as cleanup_err:
                logger.warning(f"Failed to delete temp file: {cleanup_err}")


@app.get("/")
def root():
    return {"message": "Document Processor Agent is live"}


if __name__ == "__main__":
    logger.info("Starting Document Processor...")
    uvicorn.run(app, host="127.0.0.1", port=8005)
