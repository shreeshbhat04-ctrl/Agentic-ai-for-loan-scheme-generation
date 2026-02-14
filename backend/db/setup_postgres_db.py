import psycopg2
import json
import os

# --- IMPORTANT: UPDATE THESE WITH YOUR POSTGRES DETAILS ---
DATABASE_CONFIG = {
    "dbname": "loan_chatbot_db",
    "user": "postgres", 
    "password": "shreesha04", # Make sure this matches your local setup
    "host": "localhost",
    "port": "5432"
}
# --- --- --- --- --- --- --- --- --- --- --- --- --- ---

# Path to the synthetic data file
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), 'synthetic.json')

def create_tables(conn):
    """Creates the customers, loans, and chat_messages tables."""
    cursor = conn.cursor()
    try:
        # 1. Drop old customers table to ensure schema update
        # (Be careful in production, but for dev this ensures new columns are added)
        cursor.execute("DROP TABLE IF EXISTS customers CASCADE;")
        print("Dropped old 'customers' table to update schema.")

        # 2. Create Customers Table (Updated Schema)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS customers (
                cust_id TEXT PRIMARY KEY,
                name TEXT,
                password TEXT,
                age INTEGER,
                gender TEXT,          -- NEW
                phone TEXT,
                address TEXT,
                aadhaar TEXT,         -- NEW
                credit_score INTEGER,
                pre_approved_limit INTEGER,
                interest_options TEXT[],
                category TEXT         -- NEW (Test Case Description)
            );
        """)
        print("Created updated 'customers' table.")

        # 3. Create Loans Table (Kept as is)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS loans (
                loan_id SERIAL PRIMARY KEY,
                cust_id TEXT REFERENCES customers(cust_id),
                requested_amount INTEGER,
                approved_amount INTEGER,
                status TEXT DEFAULT 'pending', 
                reason TEXT, 
                interest_rate REAL,
                tenure_months INTEGER,
                sanction_letter_path TEXT,
                salary_slip_path TEXT,      -- Ensure this exists for uploads
                kyc_doc_path TEXT,          -- Ensure this exists for uploads
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Checked/Created 'loans' table.")

        # 4. Create Chat Messages Table (Kept as is)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                message_id SERIAL PRIMARY KEY,
                loan_id INTEGER REFERENCES loans(loan_id),
                sender TEXT NOT NULL, 
                message_text TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Checked/Created 'chat_messages' table.")

        conn.commit()
    except psycopg2.Error as e:
        print(f"Error creating tables: {e}")
        conn.rollback()
    finally:
        cursor.close()

def insert_customer_data(conn, customers):
    """Inserts customer data."""
    cursor = conn.cursor()
    inserted_count = 0
    try:
        for customer in customers:
            # Insert new customer with new fields
            # Using upsert (ON CONFLICT) to handle re-runs gracefully
            cursor.execute("""
                INSERT INTO customers (
                    cust_id, name,password, age, gender, phone, address, 
                    aadhaar, credit_score, pre_approved_limit, interest_options, category
                )
                VALUES (%s, %s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (cust_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    credit_score = EXCLUDED.credit_score,
                    pre_approved_limit = EXCLUDED.pre_approved_limit;
            """, (
                customer['cust_id'],
                customer.get('name', 'N/A'),
                customer.get('password','N/A'),
                customer.get('age'),
                customer.get('gender', 'N/A'),     # NEW
                customer.get('phone'),
                customer.get('address'),
                customer.get('aadhaar', 'N/A'),    # NEW
                customer.get('credit_score'),
                customer.get('pre_approved_limit'),
                customer.get('interest_options', []), 
                customer.get('category', 'General') # NEW
            ))
            inserted_count += 1
        
        conn.commit()
        print(f"Successfully processed {inserted_count} customer records.")
    except psycopg2.Error as e:
        print(f"Error inserting customer data: {e}")
        conn.rollback()
    finally:
        cursor.close()

def main():
    conn = None
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        print("Database connection successful.")

        create_tables(conn)

        if os.path.exists(DATA_FILE_PATH):
            with open(DATA_FILE_PATH, 'r') as f:
                customers_data = json.load(f)
            insert_customer_data(conn, customers_data)
        else:
            print(f"Error: {DATA_FILE_PATH} not found.")

    except psycopg2.Error as e:
        print(f"Database connection failed: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    main()