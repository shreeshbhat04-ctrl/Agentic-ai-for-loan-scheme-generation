import uvicorn
import httpx
import logging
import math
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration ---
CREDIT_BUREAU_URL = "http://127.0.0.1:9002/credit_score"

# --- Models ---
class UnderwriteRequest(BaseModel):
    customer_id: str
    requested_loan_amount: int
    pre_approved_limit: int
    monthly_salary: int
    interest_rate: float
    loan_tenure_months: int

class CreditScoreResponse(BaseModel):
    cust_id: str
    score: int

# --- RISK ENGINE LOGIC ---
def calculate_risk_profile(credit_score: int, requested_rate: float, requested_tenure: int):
    """
    Determines risk category and adjusts terms (Rate & Tenure) based on CIBIL score.
    Simulates a sophisticated Rule Engine found in LOS platforms.
    """
    # Defaults
    risk_category = "Unknown"
    spread = 0.0
    max_tenure = 60 # Standard max is 5 years

    if credit_score >= 800:
        risk_category = "Excellent"
        spread = -0.5  # Reward: 0.5% discount
        max_tenure = 72 # Bonus: Allow 6 years
    elif credit_score >= 750:
        risk_category = "Low Risk"
        spread = 0.0   # Standard rate
        max_tenure = 60
    elif credit_score >= 700:
        risk_category = "Medium Risk"
        spread = 1.5   # Penalty: +1.5% interest
        max_tenure = 48 # Restriction: Max 4 years
    elif credit_score >= 650:
        risk_category = "High Risk"
        spread = 3.5   # Heavy Penalty: +3.5% interest
        max_tenure = 24 # Strict Restriction: Max 2 years
    else:
        return None # Score too low, automatic rejection

    # Calculate final terms
    final_rate = round(requested_rate + spread, 2)
    final_tenure = min(requested_tenure, max_tenure)

    return {
        "risk_category": risk_category,
        "final_rate": final_rate,
        "final_tenure": final_tenure,
        "message": f"Rated {risk_category}. Spread: {spread:+.1f}%"
    }

def calculate_emi(p: int, r_annual: float, n_months: int) -> float:
    """Calculates EMI."""
    if n_months <= 0 or r_annual < 0: return 0.0
    r_monthly = r_annual / (12 * 100)
    if r_monthly == 0: return p / n_months
    try:
        numerator = p * r_monthly * math.pow(1 + r_monthly, n_months)
        denominator = math.pow(1 + r_monthly, n_months) - 1
        return numerator / denominator
    except:
        return float('inf')

# --- HTTP Client ---
app_http_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global app_http_client
    app_http_client = httpx.AsyncClient()
    yield
    await app_http_client.close()

app = FastAPI(title="Underwriting Agent (Risk Engine)", lifespan=lifespan)

# --- Helper ---
async def call_credit_bureau(customer_id: str) -> CreditScoreResponse:
    try:
        response = await app_http_client.get(f"{CREDIT_BUREAU_URL}?cust_id={customer_id}")
        response.raise_for_status()
        return CreditScoreResponse(**response.json())
    except Exception as e:
        logger.error(f"Credit Bureau Error: {e}")
        raise

# --- API Endpoints ---
@app.get("/")
def root(): return {"message": "Underwriting Risk Engine is live!"}

@app.post("/underwrite")
async def underwrite(request: UnderwriteRequest):
    logger.info(f"Underwriting for {request.customer_id}: Amount {request.requested_loan_amount}")

    # 1. Fetch CIBIL Score
    try:
        score_data = await call_credit_bureau(request.customer_id)
        credit_score = score_data.score
        logger.info(f"Fetched CIBIL Score: {credit_score}")
    except:
        raise HTTPException(status_code=503, detail="Credit Bureau unavailable")

    # 2. Hard Stop: Minimum Score
    if credit_score < 650:
        return {
            "status": "rejected",
            "reason": f"Credit score {credit_score} is below the policy minimum of 650.",
            "approved_amount": 0
        }

    # 3. Policy Limit Check
    # Rule: Absolute hard limit is 2x pre-approved offer.
    # Note: 'risk_customers' asking for >2x limit are rejected here.
    if request.requested_loan_amount > (2 * request.pre_approved_limit):
         return {
            "status": "rejected",
            "reason": f"Requested amount exceeds maximum eligibility limit (2x Pre-approved).",
            "approved_amount": 0
        }

    # 4. Risk Engine: Calculate Adjusted Terms
    # This is where the 'Flexible Rate' magic happens
    risk_profile = calculate_risk_profile(
        credit_score, 
        request.interest_rate, 
        request.loan_tenure_months
    )
    
    if not risk_profile: # Should be covered by <650 check, but safe fallback
        return {"status": "rejected", "reason": "Risk profile ineligible."}

    final_rate = risk_profile["final_rate"]
    final_tenure = risk_profile["final_tenure"]
    
    logger.info(f"Risk Profile: {risk_profile['risk_category']}. Rate adjusted from {request.interest_rate}% to {final_rate}%. Tenure cap: {final_tenure}m")

    # 5. Affordability Check (EMI vs Salary)
    # We must use the NEW rate and NEW tenure for this calculation
    final_emi = calculate_emi(request.requested_loan_amount, final_rate, final_tenure)
    max_allowed_emi = request.monthly_salary * 0.50

    logger.info(f"New EMI: {final_emi:.2f} | Max Allowed: {max_allowed_emi}")

    if final_emi > max_allowed_emi:
        # User cannot afford this loan at the RISK-ADJUSTED rate
        return {
            "status": "rejected",
            "reason": (
                f"Based on your credit profile ({risk_profile['risk_category']}), "
                f"the adjusted interest rate is {final_rate}% for {final_tenure} months. "
                f"The resulting EMI ({int(final_emi)}) exceeds 50% of your salary."
            ),
            "approved_amount": 0
        }

    # 6. Approval
    return {
        "status": "approved",
        "reason": f"Approved. {risk_profile['message']}",
        "approved_amount": request.requested_loan_amount,
        # Return the MODIFIED terms
        "final_interest_rate": final_rate,
        "final_tenure": final_tenure,
        "final_emi": int(final_emi),
        "risk_category": risk_profile['risk_category']
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)