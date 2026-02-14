import uvicorn
import httpx
import logging
import json
import os
import asyncio
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional

# --- Basic Configuration ---
# Load .env relative to this file's location
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Database Configuration ---
DATABASE_CONFIG = {
    "dbname": os.getenv("DB_NAME", "loan_chatbot_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "shreesha04"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

# --- Gemini API Configuration ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY not set in sales_agent/.env file.")
else:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        logger.info("Google Generative AI configured successfully.")
    except Exception as e:
        logger.error(f"Failed to configure Google Generative AI: {e}")

# --- Global HTTP Client ---
app_http_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global app_http_client
    app_http_client = httpx.AsyncClient()
    logger.info("Sales Agent HTTP client started.")
    yield
    await app_http_client.close()
    logger.info("Sales Agent HTTP client stopped.")

app = FastAPI(title="Sales Agent (LLM Enhanced)", lifespan=lifespan)

# --- Pydantic Model ---
class SalesRequest(BaseModel):
    customer_id: str
    user_message: Optional[str] = None

# --- Database Helper ---
def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except psycopg2.Error as e:
        logger.error(f"Sales Agent DB Connection Error: {e}")
        return None

# --- NEW: Helper to Load Schemes Data ---
def get_schemes_context():
    """Reads the scraped schemes JSON and formats it for the LLM."""
    # Path: backend/agents/sales_agent/ -> go up 2 levels -> scrapers/data/janasamarth_schemes.json
    current_dir = os.path.dirname(__file__)
    schemes_path = os.path.join(current_dir, '..', '..', 'scrappers', 'data', 'jansamarth_schemes.json')
    schemes_path = os.path.abspath(schemes_path)

    if not os.path.exists(schemes_path):
        logger.warning(f"Schemes data not found at: {schemes_path}")
        return "No specific government scheme data available."

    try:
        with open(schemes_path, 'r', encoding='utf-8') as f:
            schemes = json.load(f)
        
        context_text = "GOVERNMENT SCHEMES & LOAN INFORMATION:\n"
        for scheme in schemes:
            name = scheme.get("scheme_name", "Unknown Scheme")
            content = scheme.get("content", "")
            # Limit content length to avoid token limits if necessary
            context_text += f"- Scheme: {name}\n  Details: {content[:500]}...\n\n"
            
        return context_text
    except Exception as e:
        logger.error(f"Error reading schemes file: {e}")
        return "Error loading scheme data."

# --- LLM Helper Function ---
async def get_llm_sales_response(user_query: str, customer_id: str) -> str:
    """Calls Gemini for general queries, injecting scheme data."""
    if not GOOGLE_API_KEY:
        return "I can primarily help with pre-approved personal loan offers. Please ask specifically about those."

    # 1. Load the Knowledge Base
    schemes_context = get_schemes_context()

    # 2. Inject into System Prompt
    system_prompt = f"""
    You are LoanBot, a friendly, persuasive, and knowledgeable loan sales executive for our NBFC.
    
    ### KNOWLEDGE BASE (GOVERNMENT SCHEMES):
    {schemes_context}
    
    ### INSTRUCTIONS:
    1. **Build Rapport:** Be friendly and professional.
    2. **Answer Questions:** Use the Knowledge Base above to answer questions about government schemes or general loans. If the user asks about a specific scheme mentioned above, explain its benefits.
    3. **Sell:** Highlight the benefits of our NBFC (quick process, competitive rates) even when discussing government schemes.
    4. **Guide:** Gently encourage them to proceed with a specific application ('apply for a loan') to see personalized details.
    5. **Current Info:** Today's date is October 29, 2025. Use general knowledge for market conditions.
    
    The user (Customer ID: {customer_id}) is asking: '{user_query}'
    """

    try:
        model = genai.GenerativeModel(model_name='gemini-2.5-flash-preview-09-2025')
        logger.info(f"Calling Gemini with scheme data for query: {user_query}")

        response = await model.generate_content_async(system_prompt)

        if response and hasattr(response, 'text') and response.text:
            return response.text
        elif response and response.prompt_feedback and response.prompt_feedback.block_reason:
             return "I'm sorry, I couldn't process that request due to content restrictions."
        else:
             return "Sorry, I had trouble retrieving that information right now."

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}", exc_info=True)
        return "Sorry, I encountered an error trying to get that information."

# --- Updated /sales Endpoint ---
@app.post("/sales")
async def handle_sales(request: SalesRequest):
    """
    Handles sales interaction. Checks DB first, then falls back to LLM with Scheme Data.
    """
    customer_id = request.customer_id
    user_message = request.user_message or ""
    logger.info(f"Sales request for customer {customer_id}. User message: '{user_message[:50]}...'")

    pre_approved_offer = None
    conn = get_db_connection()
    
    if conn:
        cursor = None
        try:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT pre_approved_limit, interest_options FROM customers WHERE cust_id = %s",
                (customer_id,)
            )
            offer_data = cursor.fetchone()
            if offer_data and offer_data.get("pre_approved_limit") is not None:
                pre_approved_offer = offer_data
        except psycopg2.Error as e:
            logger.error(f"DB Error fetching offer for {customer_id}: {e}")
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    use_llm = False
    if not pre_approved_offer:
        use_llm = True
    else:
        # Enhanced keyword list to catch scheme-related questions
        general_query_keywords = ["car", "home", "market", "rates", "advice", "should i", "recommend", "business", "type", "options", "compare", "scheme", "government", "subsidy", "exporter"]
        if any(keyword in user_message.lower() for keyword in general_query_keywords):
            logger.info("Offer exists, but user asked general/scheme query. Using LLM.")
            use_llm = True

    # --- Return Offer OR Call LLM ---
    if pre_approved_offer and not use_llm:
        return {
            "agent": "Sales Agent",
            "response_type": "offer",
            "message": f"Found offer for {customer_id}",
            "pre_approved_limit": pre_approved_offer.get("pre_approved_limit"),
            "interest_options": pre_approved_offer.get("interest_options", [])
        }
    else:
        logger.info("Proceeding with LLM call.")
        query_for_llm = user_message if user_message else "What loan options do you have?"
        llm_response_text = await get_llm_sales_response(query_for_llm, customer_id)
        return {
            "agent": "Sales Agent",
            "response_type": "info",
            "message": llm_response_text
        }

@app.get("/")
def root():
    return {"message": "Sales Agent (LLM + Schemes) is live!"}

if __name__ == "__main__":
    logger.info("Starting Sales Agent server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8001)