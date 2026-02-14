import psycopg2
import os
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- 1. ALLOW REACT TO CONNECT ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATABASE CONFIG ---
DATABASE_CONFIG = {
    "dbname": "loan_chatbot_db",
    "user": "postgres",
    "password": "shreesha04",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        return None

# --- 3. DATA MODELS ---
class LoginRequest(BaseModel):
    custId: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    age: str
    city: str
    phone: str
    address: str
    aadhar: str
    password: str

# 🔹 NEW: KYC RESPONSE MODEL (optional but clean)
class KYCResponse(BaseModel):
    custId: str
    name: str
    age: int
    phone: str
    address: str
    aadhaar: str
    credit_score: int | None = None
    category: str | None = None

# --- 4. API ENDPOINTS ---

@app.post("/login")
def login_user(creds: LoginRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
    
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT cust_id, name, credit_score FROM customers WHERE cust_id = %s AND password = %s", 
            (creds.custId, creds.password)
        )
        user = cursor.fetchone()
        
        if user:
            return {
                "status": "success", 
                "name": user['name'], 
                "custId": user['cust_id'],
                "credit_score": user['credit_score']
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    finally:
        if conn:
            conn.close()

@app.post("/register")
def register_user(user: RegisterRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")

    try:
        cursor = conn.cursor()
        
        new_cust_id = f"CUST-{random.randint(1000, 9999)}"
        full_address = f"{user.address}, {user.city}"

        query = """
            INSERT INTO customers (cust_id, password, name, age, phone, address, aadhaar, credit_score, category)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING cust_id
        """
        
        values = (
            new_cust_id, 
            user.password, 
            user.name, 
            int(user.age), 
            user.phone, 
            full_address,
            user.aadhar,
            750,
            "New"
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        return {"status": "success", "custId": new_cust_id}

    except psycopg2.Error as e:
        conn.rollback()
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed. Check server logs.")
    finally:
        if conn:
            conn.close()

# 🔹 NEW: ENDPOINT USED BY VERIFICATION AGENT
@app.get("/crm/{customer_id}", response_model=KYCResponse)
def get_customer_kyc(customer_id: str):
    """
    This is what your verification agent calls:
    GET http://127.0.0.1:9001/crm/{customer_id}
    """
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")

    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT cust_id, name, age, phone, address, aadhaar, credit_score, category
            FROM customers
            WHERE cust_id = %s
            """,
            (customer_id,)
        )
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Map DB row -> API response
        return {
            "custId": row["cust_id"],
            "name": row["name"],
            "age": row["age"],
            "phone": row["phone"],
            "address": row["address"],
            "aadhaar": row["aadhaar"],
            "credit_score": row.get("credit_score"),
            "category": row.get("category"),
        }

    finally:
        if conn:
            conn.close()
