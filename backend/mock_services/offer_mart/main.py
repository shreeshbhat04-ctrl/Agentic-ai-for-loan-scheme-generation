import psycopg2
import os
import json # Still needed if storing options as JSONB, not needed if using TEXT[]
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from psycopg2.extras import RealDictCursor # To get rows as dictionaries

app = FastAPI()

# --- IMPORTANT: UPDATE THESE WITH YOUR POSTGRES DETAILS ---
DATABASE_CONFIG = {
   "dbname": "loan_chatbot_db",  # Replace with your database name
    "user": "postgres", # Replace with your username
    "password": "shreesha04", # Replace with your password
    "host": "localhost",        # Often 'localhost' if running locally
    "port": "5432"                 # Default PostgreSQL port
}
# --- --- --- --- --- --- --- --- --- --- --- --- --- ---

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        # Use RealDictCursor to get results as dictionaries
        conn = psycopg2.connect(**DATABASE_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        return None

class LoanOffer(BaseModel):
    cust_id: str
    pre_approved_limit: int
    interest_options: List[str]

@app.get("/offers", response_model=LoanOffer)
def get_offers(cust_id: str):
    """Fetches customer loan offers from the PostgreSQL database."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")

    cursor = None # Initialize cursor to None
    try:
        cursor = conn.cursor()
        # Use %s placeholder for psycopg2
        cursor.execute("SELECT cust_id, pre_approved_limit, interest_options FROM customers WHERE cust_id = %s", (cust_id,))
        customer_row = cursor.fetchone() # Fetchone returns a dictionary now
    except psycopg2.Error as e:
        print(f"Database query error: {e}")
        raise HTTPException(status_code=500, detail="Database query error")
    finally:
        # Ensure cursor and connection are closed even if errors occurred
        if cursor:
            cursor.close()
        if conn:
            conn.close()

    if customer_row:
        # customer_row is already a dictionary thanks to RealDictCursor
        # psycopg2 automatically converts TEXT[] from DB to a Python list
        # If you used JSONB instead of TEXT[], no change is needed here either,
        # as psycopg2 usually handles JSONB to Python list/dict conversion.
        return LoanOffer(
            cust_id=customer_row['cust_id'],
            pre_approved_limit=customer_row['pre_approved_limit'],
            interest_options=customer_row['interest_options'] # Direct assignment works for TEXT[] and often JSONB
        )
    else:
        raise HTTPException(status_code=404, detail="Customer not found")

# To run this service:
# Ensure PostgreSQL is running and the table is populated
# cd backend/mock_services/offer_mart
# uvicorn offer_service:app --port 9003

