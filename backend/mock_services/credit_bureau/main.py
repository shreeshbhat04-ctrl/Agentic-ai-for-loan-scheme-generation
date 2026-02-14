import psycopg2
import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor # To get rows as dictionaries

app = FastAPI()

# --- IMPORTANT: UPDATE THESE WITH YOUR POSTGRES DETAILS ---
DATABASE_CONFIG = {
    "dbname": "loan_chatbot_db",  # Replace with your database name
    "user": "postgres", # Replace with your username
    "password": "shreesha04", # Replace with your password
    "host": "localhost",        # Often 'localhost' if running locally
    "port": "5432"            # Default PostgreSQL port
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

class CreditScore(BaseModel):
    cust_id: str
    score: int # Field name in the Pydantic model

@app.get("/credit_score", response_model=CreditScore)
def get_credit_score(cust_id: str):
    """Fetches customer credit score from the PostgreSQL database."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")

    cursor = None # Initialize cursor to None
    try:
        cursor = conn.cursor()
        # Select the correct column name from the DB ('credit_score')
        # Use %s placeholder for psycopg2
        cursor.execute("SELECT cust_id, credit_score FROM customers WHERE cust_id = %s", (cust_id,))
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
        # Map DB column 'credit_score' to Pydantic field 'score'
        return CreditScore(cust_id=customer_row['cust_id'], score=customer_row['credit_score'])
    else:
        raise HTTPException(status_code=404, detail="Customer not found")

# To run this service:
# Ensure PostgreSQL is running and the table is populated
# cd backend/mock_services/credit_bureau
# uvicorn bureau_service:app --port 9002

