from fastapi import FastAPI, HTTPException, UploadFile, File
import uvicorn
import httpx
from pydantic import BaseModel
import logging
import re
import pdfplumber  # <--- Replaces pytesseract/pdf2image
from io import BytesIO

# --- Configuration ---
app = FastAPI(title="Verification Agent (Text-Based)")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CRM_SERVICE_URL = "http://127.0.0.1:9001/crm"

# --- Helper Class ---
class BankStatementAnalyzer:
    def __init__(self):
        # Same regex patterns
        self.amount_pattern = re.compile(r"[-+]?\d{1,3}(?:,\d{3})*\.\d{2}")
        self.date_pattern = re.compile(r"\d{2}[/-]\d{2}[/-]\d{4}")
        
        self.income_keywords = ["salary", "credit", "transfer in", "dividend", "interest"]
        self.expense_keywords = ["debit", "withdrawal", "rent", "shopping", "food", "emi", "utility", "atm"]

    def extract_text_from_pdf(self, file_bytes):
        """
        Extracts text from a 'True' PDF using pdfplumber.
        Much faster and doesn't require Tesseract/Poppler.
        """
        try:
            full_text = ""
            with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    # Extract text, maintaining layout as best as possible
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
            return full_text
        except Exception as e:
            logger.error(f"PDF Parsing Failed: {e}")
            return ""

    def parse_transactions(self, text):
        """Parses raw text into structured transaction data."""
        lines = text.split('\n')
        transactions = []
        
        for line in lines:
            date_match = self.date_pattern.search(line)
            amount_matches = self.amount_pattern.findall(line)
            
            if date_match and amount_matches:
                # Basic parsing logic (same as before)
                try:
                    amount_str = amount_matches[-1].replace(',', '') # Take the last match often typically amount
                    amount = float(amount_str)
                    
                    # Clean description
                    description = line.replace(date_match.group(), "").replace(amount_matches[-1], "").strip()
                    
                    # Simple classification
                    tx_type = "Expense"
                    if amount < 0:
                        tx_type = "Expense"
                    elif any(word in description.lower() for word in self.income_keywords):
                        tx_type = "Income"
                    elif any(word in description.lower() for word in self.expense_keywords):
                        tx_type = "Expense"
                    else:
                        tx_type = "Income" if amount > 0 else "Expense"

                    transactions.append({
                        "date": date_match.group(),
                        "description": description,
                        "amount": amount,
                        "type": tx_type
                    })
                except ValueError:
                    continue 

        return transactions

    def calculate_score(self, transactions):
        """Calculates financial health score."""
        if not transactions:
            return 0, {}

        total_income = sum(t['amount'] for t in transactions if t['type'] == 'Income')
        total_expenses = sum(abs(t['amount']) for t in transactions if t['type'] == 'Expense')
        
        has_salary = any("salary" in t['description'].lower() for t in transactions)
        income_stability_score = 20 if has_salary else 5

        if total_income > 0:
            expense_ratio = total_expenses / total_income
        else:
            expense_ratio = 1.0 
            
        volatility_penalty = min(expense_ratio * 20, 30)
        raw_score = 50 + income_stability_score - volatility_penalty
        final_score = max(0, min(100, int(raw_score)))

        insights = {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_flow": total_income - total_expenses,
            "salary_detected": has_salary
        }
        
        return final_score, insights

analyzer = BankStatementAnalyzer()

# --- Models ---
class VerificationRequest(BaseModel):
    customer_id: str

# --- API Endpoints ---

@app.post("/verify")
async def verify_kyc(request: VerificationRequest):
    """(Existing CRM Logic)"""
    customer_id = request.customer_id
    logger.info(f"Checking CRM for: {customer_id}")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{CRM_SERVICE_URL}/{customer_id}")
            resp.raise_for_status()
            return {"status": "verified", "kyc": resp.json()}
        except Exception as e:
            raise HTTPException(500, detail=str(e))

@app.post("/analyze-statement")
async def analyze_bank_statement(file: UploadFile = File(...)):
    """
    Parses a digital PDF bank statement (no scans).
    """
    if file.content_type != "application/pdf":
        raise HTTPException(400, detail="File must be a PDF")

    file_bytes = await file.read()
    
    # 1. Extract Text (No OCR)
    raw_text = analyzer.extract_text_from_pdf(file_bytes)
    
    if not raw_text.strip():
        return {
            "status": "failed",
            "message": "Could not extract text. If this is a scanned image, OCR is required (not enabled)."
        }

    # 2. Parse & Score
    transactions = analyzer.parse_transactions(raw_text)
    score, insights = analyzer.calculate_score(transactions)
    
    return {
        "filename": file.filename,
        "score": score,
        "insights": insights,
        "transactions_preview": transactions[:5]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)