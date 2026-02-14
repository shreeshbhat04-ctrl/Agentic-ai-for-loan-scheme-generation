import uvicorn
import httpx
import logging
import json
import os
import asyncio
import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fpdf import FPDF
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List
from pymongo import MongoClient
import datetime


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === DATABASE CONFIG ===
DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME", "loan_chatbot_db"),
    "user": os.getenv("DB_USER", "your_postgres_user"),
    "password": os.getenv("DB_PASSWORD", "your_postgres_password"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

# === MONGODB CONFIG ===
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "loan_archives")

CRM_SERVICE_URL = "http://127.0.0.1:9001/crm"
OUTPUT_DIR = "../../sanction_letters/"
os.makedirs(OUTPUT_DIR, exist_ok=True)

app_http_client = None
mongo_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global app_http_client, mongo_client
    app_http_client = httpx.AsyncClient()
    
    try:
        mongo_client = MongoClient(MONGO_URI)
        mongo_client.admin.command('ping')
        logger.info("Connected to MongoDB successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
    
    yield
    
    await app_http_client.close()
    if mongo_client:
        mongo_client.close()
    logger.info("Sanction Agent shutdown.")

app = FastAPI(title="Sanction Letter Generator Agent", lifespan=lifespan)

# === PYDANTIC MODELS ===
class SanctionRequest(BaseModel):
    customer_id: str
    loan_id: int
    loan_amount: int
    interest_rate: float
    tenure_months: int

class ArchiveRequest(BaseModel):
    """Request to manually archive a conversation (for rejections)"""
    customer_id: str
    loan_id: int
    status: str  # "approved" or "rejected"
    reason: Optional[str] = None
    loan_amount: Optional[int] = None
    interest_rate: Optional[float] = None

# === HELPER FUNCTIONS ===

def get_pg_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except psycopg2.Error as e:
        logger.error(f"Postgres Connection Error: {e}")
        return None

async def db_save_sanction_path(loan_id: int, file_path: str):
    """Saves PDF path to Postgres."""
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _sync_save_path, loan_id, file_path)

def _sync_save_path(loan_id: int, file_path: str):
    conn = get_pg_connection()
    if not conn:
        return
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE loans SET sanction_letter_path = %s, updated_at = CURRENT_TIMESTAMP WHERE loan_id = %s",
                (file_path, loan_id)
            )
            conn.commit()
    except Exception as e:
        logger.error(f"Error updating Postgres: {e}")
    finally:
        conn.close()

def _sync_fetch_chat_history(loan_id: int) -> List[dict]:
    """
    Fetches chat messages directly from MongoDB for a specific loan.
    No Postgres involved here anymore.
    """
    if not mongo_client:
        logger.warning("MongoDB client not available while fetching chat history.")
        return []

    try:
        db = mongo_client[MONGO_DB_NAME]
        collection = db["chat_messages"]  # adjust name if you use a different collection

        cursor = collection.find({"loan_id": loan_id}).sort("timestamp", 1)
        messages: List[dict] = []
        for doc in cursor:
            ts = doc.get("timestamp")
            if isinstance(ts, datetime.datetime):
                ts = ts.isoformat()
            messages.append({
                "sender": doc.get("sender"),
                "message_text": doc.get("message_text"),
                "timestamp": ts,
            })
        return messages
    except Exception as e:
        logger.error(f"Error fetching chat history from MongoDB: {e}")
        return []


async def archive_conversation_to_mongo(
    customer_id: str,
    loan_id: int,
    status: str,
    loan_amount: Optional[int] = None,
    interest_rate: Optional[float] = None,
    tenure_months: Optional[int] = None,
    file_path: Optional[str] = None,
    reason: Optional[str] = None
):
    """
    Archive a complete loan conversation to MongoDB.
    Works for both APPROVED and REJECTED loans.
    """
    if not mongo_client:
        logger.warning("MongoDB client not available. Skipping archival.")
        return

    loop = asyncio.get_running_loop()
    
    # Fetch chat history from Postgres
    chat_history = await loop.run_in_executor(None, _sync_fetch_chat_history, loan_id)

    # Construct the archive document
    archive_doc = {
        "loan_id": loan_id,
        "customer_id": customer_id,
        "status": status,  # "approved" or "rejected"
        "loan_details": {
            "amount": loan_amount,
            "interest_rate": interest_rate,
            "tenure": tenure_months,
            "sanction_letter_path": file_path
        },
        "rejection_reason": reason,  # Only populated if rejected
        "chat_transcript": chat_history,
        "archived_at": datetime.datetime.utcnow()
    }

    # Insert into MongoDB
    try:
        db = mongo_client[MONGO_DB_NAME]
        collection = db["loan_applications"]
        
        # Replace existing document (avoid duplicates)
        result = await loop.run_in_executor(None, lambda: collection.replace_one(
            {"loan_id": loan_id},
            archive_doc,
            upsert=True
        ))
        
        logger.info(f"Archived loan {loan_id} to MongoDB. Status: {status}")
        return True
    except Exception as e:
        logger.error(f"Error inserting into MongoDB: {e}")
        return False

# === PDF GENERATION ===

# === PDF CLASS ===
class PDF(FPDF):

    def header(self):
        self.set_font('Arial', 'B', 14)
        self.cell(0, 6, 'Tata Capital Finance Limited', 0, 1, 'C')
        self.ln(1)
        self.set_font('Arial', 'B', 11)
        self.cell(0, 6, 'LOAN SANCTION LETTER', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-18)
        self.set_font('Arial', 'I', 7)
        self.cell(0, 4, 'Tata Capital Finance Limited', 0, 1, 'C')
        self.cell(
            0, 4,
            'Registered Office: 11th Floor, Tower A, Peninsula Business Park, '
            'Ganpatrao Kadam Marg, Lower Parel, Mumbai - 400 013.',
            0, 1, 'C'
        )
        self.cell(0, 4, f'Page {self.page_no()}', 0, 0, 'C')


# === PDF GENERATION FUNCTION ===
async def generate_sanction_pdf(request) -> Optional[str]:

    customer_name = getattr(request, "customer_name", "Customer")
    address = getattr(request, "address", "")
    today_str = datetime.date.today().strftime('%d-%b-%Y')

    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Date
    pdf.set_font('Arial', '', 9)
    pdf.cell(0, 5, f"Date: {today_str}", ln=1, align='R')
    pdf.ln(3)

    # Address block
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 5, "To,", ln=1)

    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 5, customer_name.upper(), ln=1)

    pdf.set_font('Arial', '', 10)
    for line in str(address).split('\n'):
        if line.strip():
            pdf.cell(0, 5, line.strip(), ln=1)

    pdf.ln(5)

    # Subject
    pdf.set_font('Arial', 'B', 10)
    subject = f"Subject: Your Personal Loan Application No. {request.loan_id}"
    pdf.multi_cell(0, 5, subject)

    pdf.ln(1)
    pdf.cell(0, 5, "Loan Type: Personal Loan", ln=1)
    pdf.ln(4)

    # Intro
    pdf.set_font('Arial', '', 10)
    pdf.multi_cell(
        0, 5,
        "Dear Sir/Madam,\n\n"
        "We are pleased to inform you that based on your above mentioned application, "
        "Tata Capital Finance Limited (hereinafter referred to as the \"Company\") "
        "has in principle sanctioned the Personal Loan on the terms and conditions "
        "mentioned below and subject to execution of necessary documents."
    )

    pdf.ln(4)

    # Table heading
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 5, "The salient features of the financial terms of the loan are as under:", ln=1)
    pdf.ln(3)

    # Table setup
    col_widths = [38, 28, 28, 38, 28]
    headers = [
        "Total Amount Sanctioned",
        "Rate of Interest",
        "Tenure",
        "Monthly Installment (EMI)",
        "Processing Fee"
    ]
    row_height = 10

    # Header row
    pdf.set_font('Arial', 'B', 8)
    x_start = pdf.get_x()
    y_start = pdf.get_y()

    for i, header in enumerate(headers):
        pdf.set_xy(x_start + sum(col_widths[:i]), y_start)
        pdf.multi_cell(col_widths[i], row_height / 2, header, border=1, align='C')

    pdf.set_y(y_start + row_height)

    # Values
    pdf.set_font('Arial', '', 8)

    values = [
        f"INR {request.loan_amount:,.2f}",
        f"{request.interest_rate:.2f}% (Floating)",
        f"{request.tenure_months} Months",
        f"INR {request.emi:,.2f}",
        f"INR {request.processing_fee:,.2f}",
    ]

    x_start = pdf.get_x()
    y_start = pdf.get_y()

    for i, value in enumerate(values):
        pdf.set_xy(x_start + sum(col_widths[:i]), y_start)
        pdf.multi_cell(col_widths[i], row_height, value, border=1, align='C')

    pdf.set_y(y_start + row_height + 3)

    # Notes
    pdf.set_font('Arial', '', 8)
    pdf.multi_cell(
        0, 4,
        "* New Retail Prime Lending Rate (NRPLR) is the rate announced by the Company "
        "from time to time and shall govern the applicable rate of interest."
    )
    pdf.ln(2)
    pdf.multi_cell(
        0, 4,
        "** In case of Fixed Rate, upon expiry of the fixed period, the loan shall "
        "attract a floating rate based on prevailing NRPLR."
    )

    pdf.ln(5)

    # Special conditions
    pdf.set_font('Arial', 'B', 9)
    pdf.cell(0, 5, "Special Conditions:", ln=1)
    pdf.set_font('Arial', '', 9)

    conditions = [
        "The loan shall be utilized strictly for personal purposes only.",
        "The borrower shall ensure timely payment of EMIs as per the repayment schedule.",
        "Any delay or default may attract penal charges as per Company policy."
    ]

    for c in conditions:
        pdf.cell(4, 4, "-")
        pdf.multi_cell(0, 4, c)
        pdf.ln(1)

    pdf.ln(8)

    # Signatures
    pdf.cell(0, 5, "For Tata Capital Finance Limited", ln=1)
    pdf.ln(15)

    x = pdf.get_x()
    y = pdf.get_y()
    gap = 60

    for i in range(3):
        pdf.set_xy(x + i * gap, y)
        pdf.cell(25, 5, "_" * 15)
        pdf.set_xy(x + i * gap, y + 6)
        pdf.cell(25, 5, "Authorized Signatory")



    # ---- Save file ----
    file_name = f"sanction_{request.customer_id}_{request.loan_id}.pdf"
    full_path = os.path.join(OUTPUT_DIR, file_name)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, lambda: pdf.output(full_path, "F"))
    
    return os.path.join("sanction_letters", file_name).replace("\\", "/")

# === ENDPOINTS ===

@app.post("/sanction")
async def generate_sanction_endpoint(request: SanctionRequest):
    """Generate sanction letter for APPROVED loans and archive to MongoDB."""
    logger.info(f"Processing sanction for Loan {request.loan_id}")

    # 1. Generate PDF
    path = await generate_sanction_pdf(request)
    if not path:
        raise HTTPException(status_code=500, detail="PDF Generation Failed")

    # 2. Update Postgres
    await db_save_sanction_path(request.loan_id, path)

    # 3. Archive to MongoDB (APPROVED status)
    await archive_conversation_to_mongo(
        customer_id=request.customer_id,
        loan_id=request.loan_id,
        status="approved",
        loan_amount=request.loan_amount,
        interest_rate=request.interest_rate,
        tenure_months=request.tenure_months,
        file_path=path
    )

    return {"file_path": path}


@app.post("/archive/rejection")
async def archive_rejection(request: ArchiveRequest):
    """
    Archive a REJECTED loan to MongoDB.
    Call this endpoint when underwriting rejects the user.
    Master agent should call this with rejection details.
    """
    logger.info(f"Archiving rejection for Loan {request.loan_id}")
    
    # Archive to MongoDB (REJECTED status)
    success = await archive_conversation_to_mongo(
        customer_id=request.customer_id,
        loan_id=request.loan_id,
        status="rejected",
        loan_amount=request.loan_amount,
        interest_rate=request.interest_rate,
        reason=request.reason
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to archive rejection")
    
    return {
        "status": "archived",
        "loan_id": request.loan_id,
        "message": f"Loan {request.loan_id} rejection archived to MongoDB"
    }


# === RETRIEVAL ENDPOINTS ===

@app.get("/archive/loan/{loan_id}")
async def get_loan_archive(loan_id: int):
    """Retrieve full loan archive from MongoDB (approved or rejected)."""
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB not available")
    
    try:
        loop = asyncio.get_running_loop()
        
        def _fetch_archive():
            db = mongo_client[MONGO_DB_NAME]
            collection = db["loan_applications"]
            doc = collection.find_one({"loan_id": loan_id})
            return doc
        
        archive = await loop.run_in_executor(None, _fetch_archive)
        
        if not archive:
            raise HTTPException(status_code=404, detail=f"No archive found for loan {loan_id}")
        
        archive.pop('_id', None)
        return archive
    except Exception as e:
        logger.error(f"Error fetching archive: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/archive/loan/{loan_id}/chat")
async def get_loan_chat_transcript(loan_id: int):
    """Get only the chat transcript for a specific loan."""
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB not available")
    
    try:
        loop = asyncio.get_running_loop()
        
        def _fetch_chat():
            db = mongo_client[MONGO_DB_NAME]
            collection = db["loan_applications"]
            doc = collection.find_one(
                {"loan_id": loan_id},
                {"chat_transcript": 1}
            )
            return doc
        
        archive = await loop.run_in_executor(None, _fetch_chat)
        
        if not archive or 'chat_transcript' not in archive:
            raise HTTPException(status_code=404, detail=f"No chat found for loan {loan_id}")
        
        return {
            "loan_id": loan_id,
            "chat_transcript": archive.get('chat_transcript', [])
        }
    except Exception as e:
        logger.error(f"Error fetching chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/archive/customer/{customer_id}")
async def get_customer_loans(customer_id: str):
    """Get all loan archives for a specific customer (approved and rejected)."""
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB not available")
    
    try:
        loop = asyncio.get_running_loop()
        
        def _fetch_customer_loans():
            db = mongo_client[MONGO_DB_NAME]
            collection = db["loan_applications"]
            docs = list(collection.find({"customer_id": customer_id}))
            for doc in docs:
                doc.pop('_id', None)
            return docs
        
        loans = await loop.run_in_executor(None, _fetch_customer_loans)
        
        if not loans:
            raise HTTPException(status_code=404, detail=f"No loans found for customer {customer_id}")
        
        return {
            "customer_id": customer_id,
            "loan_count": len(loans),
            "approved": len([l for l in loans if l.get('status') == 'approved']),
            "rejected": len([l for l in loans if l.get('status') == 'rejected']),
            "loans": loans
        }
    except Exception as e:
        logger.error(f"Error fetching customer loans: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/archive/search")
async def search_archives(
    customer_id: str = None,
    loan_id: int = None,
    status: str = None
):
    """Search loan archives with filters (approved/rejected)."""
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB not available")
    
    try:
        loop = asyncio.get_running_loop()
        
        def _search():
            db = mongo_client[MONGO_DB_NAME]
            collection = db["loan_applications"]
            
            filters = {}
            if customer_id:
                filters["customer_id"] = customer_id
            if loan_id:
                filters["loan_id"] = loan_id
            if status:
                filters["status"] = status
            
            if not filters:
                raise ValueError("At least one filter parameter required")
            
            docs = list(collection.find(filters))
            for doc in docs:
                doc.pop('_id', None)
            return docs
        
        results = await loop.run_in_executor(None, _search)
        
        return {
            "filters": {
                "customer_id": customer_id,
                "loan_id": loan_id,
                "status": status
            },
            "count": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"Error searching archives: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/archive/export/{loan_id}")
async def export_loan_as_json(loan_id: int):
    """Export complete loan archive as JSON (approved or rejected)."""
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB not available")
    
    try:
        loop = asyncio.get_running_loop()
        
        def _fetch_and_format():
            db = mongo_client[MONGO_DB_NAME]
            collection = db["loan_applications"]
            doc = collection.find_one({"loan_id": loan_id})
            if doc:
                doc.pop('_id', None)
                if 'archived_at' in doc:
                    doc['archived_at'] = str(doc['archived_at'])
            return doc
        
        archive = await loop.run_in_executor(None, _fetch_and_format)
        
        if not archive:
            raise HTTPException(status_code=404, detail=f"No archive found for loan {loan_id}")
        
        return archive
    except Exception as e:
        logger.error(f"Error exporting archive: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def root():
    return {"message": "Sanction Agent is live"}


if __name__ == "__main__":
    logger.info("Starting Sanction Agent...")
    uvicorn.run("main:app", host="127.0.0.1", port=8004)