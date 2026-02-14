# CRITICAL: Compatibility shim MUST be at the very top, before any other imports
import sys
import types
import langchain_core

if not hasattr(langchain_core, 'pydantic_v1'):
    import pydantic
    from pydantic import field_validator, model_validator
    
    pydantic_v1_module = types.ModuleType('pydantic_v1')
    pydantic_v1_module.SecretStr = pydantic.SecretStr
    
    if hasattr(pydantic, 'PrivateAttr'):
        pydantic_v1_module.PrivateAttr = pydantic.PrivateAttr
    else:
        class PrivateAttr:
            def __init__(self, default=None, **kwargs):
                self.default = default
        pydantic_v1_module.PrivateAttr = PrivateAttr
    
    def root_validator(*fields, **kwargs):
        def decorator(func):
            return model_validator(mode='before')(func)
        return decorator
    
    pydantic_v1_module.root_validator = root_validator
    pydantic_v1_module.BaseModel = pydantic.BaseModel
    pydantic_v1_module.Field = pydantic.Field
    pydantic_v1_module.validator = field_validator
    
    langchain_core.pydantic_v1 = pydantic_v1_module
    sys.modules['langchain_core.pydantic_v1'] = pydantic_v1_module

import uvicorn
import httpx
import logging
import json
import re
import asyncio
import os
from collections import defaultdict
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import time
from pymongo import MongoClient
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import add_messages
from typing import TypedDict, List, Annotated, Any, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

user_locks = defaultdict(asyncio.Lock)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "loan_archives")
mongo_client = None

# === POSTGRES CONFIG ===
PG_DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "loan_chatbot_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "shreesha04"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

# === RATE LIMITING FOR FREE TIER ===
request_times = defaultdict(list)
MAX_REQUESTS_PER_MINUTE = 10

# === AGENT URLS ===
AGENT_URLS = {
    "sales": "http://127.0.0.1:8001/sales",
    "verification": "http://127.0.0.1:8002/verify",
    "verification_statement": "http://127.0.0.1:8002/analyze-statement",  # NEW
    "underwriting": "http://127.0.0.1:8003/underwrite",
    "sanction": "http://127.0.0.1:8004/sanction",
    "doc_processor": "http://127.0.0.1:8005/verify_salary",
}

# === GEMINI API CONFIG ===
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY not set. Please create a .env file with your API key.")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY,
    convert_system_message_to_human=True,
    temperature=0.7,
    max_retries=3
)

app_http_client = None
app_graph = None
memory_saver = None

# === PYDANTIC MODELS ===
class ChatRequest(BaseModel):
    customer_id: str
    message: str

# === TOOLS DEFINITION ===
@tool
async def tool_get_sales_offer(customer_id: str) -> dict:
    """Get pre-approved loan offer. Call this FIRST. Returns pre_approved_limit and interest_rate_str."""
    logger.info(f"Tool: Getting sales offer for {customer_id}")
    try:
        response = await app_http_client.post(AGENT_URLS["sales"], json={"customer_id": customer_id})
        response.raise_for_status()
        result = response.json()
        
        normalized = {
            "pre_approved_limit": result.get('pre_approved_limit', 0),
            "interest_rate": float(result.get('interest_options', ['8.5'])[0].replace('%', '')) if result.get('interest_options') else 8.5,
            "message": result.get('message', ''),
            "status": "success"
        }
        logger.info(f"Sales offer result: {normalized}")
        return normalized
    except Exception as e:
        logger.error(f"Sales agent error: {e}")
        return {"error": str(e), "status": "failed"}

@tool
async def tool_sales_conversation(customer_id: str, user_message: str) -> dict:
    """Engage with sales agent for ANY questions about loan products, schemes, government programs, interest rates, or loan details. 
    The sales agent has expert knowledge about government schemes like MUDRA, PMEGP, PMAY-U, Solar financing, etc.
    Use this tool when user asks about: what loans are available, government schemes, subsidies, eligibility, comparisons, or any product information."""
    logger.info(f"Tool: Sales conversation for {customer_id}: {user_message}")
    try:
        payload = {"customer_id": customer_id, "message": user_message}
        response = await app_http_client.post(AGENT_URLS["sales"], json=payload)
        response.raise_for_status()
        result = response.json()
        
        # Extract the detailed message from sales agent
        sales_message = result.get('message', '')
        
        sales_response = {
            "message": sales_message,  # This contains the detailed scheme information
            "pre_approved_limit": result.get('pre_approved_limit'),
            "interest_options": result.get('interest_options'),
            "response_type": result.get('response_type', 'info'),
            "status": "success"
        }
        logger.info(f"Sales conversation result (truncated): {sales_message[:200]}...")
        return sales_response
    except Exception as e:
        logger.error(f"Sales conversation error: {e}")
        return {"error": str(e), "message": "Sorry, I couldn't reach the sales agent.", "status": "failed"}

@tool
async def tool_verify_kyc(customer_id: str) -> dict:
    """Verify customer KYC status. Call BEFORE underwriting. Returns kyc_status."""
    logger.info(f"Tool: Verifying KYC for {customer_id}")
    try:
        response = await app_http_client.post(AGENT_URLS["verification"], json={"customer_id": customer_id})
        response.raise_for_status()
        result = response.json()
        logger.info(f"KYC verification result: {result}")
        return result
    except Exception as e:
        logger.error(f"Verification agent error: {e}")
        return {"error": str(e), "kyc_status": "failed"}

@tool
async def tool_analyze_bank_statement(file_path: str) -> dict:
    """Analyze bank statement PDF to calculate financial health score. Extract income, expenses, and account balance. Returns score (0-100), insights, and transaction preview."""
    logger.info(f"Tool: Analyzing bank statement: {file_path}")
    try:
        # Read the file
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'application/pdf')}
            response = await app_http_client.post(
                AGENT_URLS["verification_statement"],
                files=files
            )
        
        response.raise_for_status()
        result = response.json()
        
        logger.info(f"Bank statement analysis result: {result}")
        return {
            "status": result.get('status', 'failed'),
            "score": result.get('score', 0),
            "insights": result.get('insights', {}),
            "transactions_preview": result.get('transactions_preview', []),
            "filename": result.get('filename', ''),
            "message": result.get('message', '')
        }
    except Exception as e:
        logger.error(f"Bank statement analysis error: {e}")
        return {"status": "failed", "error": str(e), "score": 0}

@tool
async def tool_run_underwriting(
    customer_id: str, 
    requested_loan_amount: int, 
    pre_approved_limit: int, 
    monthly_salary: int, 
    interest_rate: float, 
    loan_tenure_months: int
) -> dict:
    """Run underwriting check with risk engine. Returns approval status with risk-adjusted terms."""
    logger.info(f"Tool: Running underwriting for {customer_id}")
    try:
        payload = {
            "customer_id": customer_id,
            "requested_loan_amount": requested_loan_amount,
            "pre_approved_limit": pre_approved_limit,
            "monthly_salary": monthly_salary,
            "interest_rate": interest_rate,
            "loan_tenure_months": loan_tenure_months
        }
        response = await app_http_client.post(AGENT_URLS["underwriting"], json=payload)
        response.raise_for_status()
        result = response.json()
        logger.info(f"Underwriting result: {result}")
        return result
    except Exception as e:
        logger.error(f"Underwriting agent error: {e}")
        return {"error": str(e), "status": "failed"}

@tool
async def tool_generate_sanction(
    customer_id: str, 
    loan_id: int,
    loan_amount: int, 
    interest_rate: float, 
    tenure_months: int
) -> dict:
    """Generate sanction letter PDF. Only call after user is approved."""
    logger.info(f"Tool: Generating sanction letter for {customer_id}, loan_id: {loan_id}")
    try:
        payload = {
            "customer_id": customer_id,
            "loan_id": loan_id,
            "loan_amount": loan_amount,
            "interest_rate": interest_rate,
            "tenure_months": tenure_months
        }
        logger.info(f"Sending to sanction agent: {payload}")
        response = await app_http_client.post(AGENT_URLS["sanction"], json=payload)
        
        logger.info(f"Sanction agent response status: {response.status_code}")
        response.raise_for_status()
        result = response.json()
        file_path = result.get('file_path', 'N/A')
        if file_path != 'N/A':
            file_path = file_path.replace("../../", "")
        return {"status": "success", "file_path": file_path}
    except Exception as e:
        logger.error(f"Sanction agent error: {e}")
        return {"error": str(e), "status": "failed"}

@tool
async def tool_verify_salary_document(customer_id: str, file_path: str) -> dict:
    """Verify salary from salary slip or income document. Returns verified salary amount."""
    logger.info(f"Tool: Verifying salary document for {customer_id}: {file_path}")
    try:
        payload = {"file_path": file_path}
        response = await app_http_client.post(AGENT_URLS["doc_processor"], json=payload)
        response.raise_for_status()
        result = response.json()
        
        salary_result = {
            "status": result.get('status', 'failed'),
            "monthly_salary": result.get('monthly_salary'),
            "salary_source": result.get('salary_source'),
            "document_type": result.get('document_type'),
            "confidence": result.get('confidence', 0),
            "error": result.get('error')
        }
        
        logger.info(f"Salary verification result: {salary_result}")
        return salary_result
    except Exception as e:
        logger.error(f"Salary verification error: {e}")
        return {"status": "failed", "error": str(e)}

@tool
async def tool_archive_rejection(
    customer_id: str,
    loan_id: int,
    requested_loan_amount: int,
    interest_rate: float,
    rejection_reason: str
) -> dict:
    """Archive a rejected loan application to MongoDB."""
    logger.info(f"Tool: Archiving rejection for loan {loan_id}")
    try:
        payload = {
            "customer_id": customer_id,
            "loan_id": loan_id,
            "status": "rejected",
            "loan_amount": requested_loan_amount,
            "interest_rate": interest_rate,
            "reason": rejection_reason
        }
        response = await app_http_client.post(
            f"{AGENT_URLS['sanction'].replace('/sanction', '')}/archive/rejection",
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        
        logger.info(f"Rejection archived: {result}")
        return {"status": "archived", "message": result.get('message')}
    except Exception as e:
        logger.error(f"Rejection archival error: {e}")
        return {"status": "failed", "error": str(e)}

tools = [
    tool_get_sales_offer, 
    tool_sales_conversation, 
    tool_verify_kyc, 
    tool_analyze_bank_statement,  # NEW
    tool_run_underwriting, 
    tool_generate_sanction, 
    tool_verify_salary_document, 
    tool_archive_rejection
]

# === SYSTEM PROMPT ===
SYSTEM_PROMPT = """You are a friendly and professional loan sales assistant. Your name is LoanBot.

CRITICAL RULES - FOLLOW EXACTLY:
1. FIRST - Always call tool_get_sales_offer with customer_id to get their pre_approved_limit 
2. SALES QUERIES - If user asks about:
   - Loan options, product details, interest rates
   - Government schemes, subsidies, or benefits
   - Specific loan purposes (business, Medical,tractor, home, etc.)
   - Comparisons between loan types
   - ANY question about loan products or schemes
   → IMMEDIATELY call tool_sales_conversation with their EXACT message,at first present only the offer he is eligible for based on pre_approved_limit then ask questions on what they want based what he/she intially asked
   → The sales agent has expert knowledge about government schemes and will provide detailed information
   → Present the sales agent's response to the user
   → Dont use special characters like * or - for bullet points instead use simple text formatting
   → DO NOT make up information about schemes or products
   → The goal is to be persevacive on what schemes to recommend & don't bombard them with question at the sametime ask one at a time and keep the msg short like the data in first and the questioning part if the user queries more present him so based on the needs
   - Ask more about what they want like Why they need the loan & Scenario they are in based on that give structered response
   - The response should be sympathetic and more of sales oriented connecting with user's needs and emotions
3. ASK AMOUNT - After answering their questions, ask: "How much would you like to apply for?"
4. CHECK AMOUNT - When user gives amount:
   - IF amount > (2 * pre_approved_limit): REJECT. Call tool_archive_rejection. Do NOT proceed.
   - IF pre_approved_limit < amount <= (2 * pre_approved_limit): ASK monthly_salary
   - IF amount <= pre_approved_limit: Skip salary, continue to step 6
5. CONTINUE SALES CONVERSATION:
   - If user has follow-up questions about schemes, eligibility, or loan details
   - Call tool_sales_conversation again with their question
   - The sales agent maintains conversation context
6. SALARY/DOCUMENT VERIFICATION:
   - If user mentions "salary slip", "bank statement", "upload document", ask for file path
   - For SALARY SLIP: Call tool_verify_salary_document
   - For BANK STATEMENT: Call tool_analyze_bank_statement (provides financial health score)
   - Bank statement analysis gives insights into income stability and spending patterns
7. VERIFY KYC - Call tool_verify_kyc with customer_id
8. UNDERWRITING - Only if kyc_status is "verified":
   - Call tool_run_underwriting with all parameters
   - The underwriting engine uses a RISK-BASED pricing model:
     * Credit score 800+: Gets 0.5% DISCOUNT + 72 months max tenure
     * Credit score 750-799: Standard rate + 60 months max
     * Credit score 700-749: +1.5% rate + 48 months max
     * Credit score 650-699: +3.5% rate + 24 months max
     * Below 650: Automatic rejection
   - Always use: loan_tenure_months=36 initially (will be adjusted by risk engine)
   - CRITICAL: If the requested amount is > 4x monthly_salary, you MUST ask for a bank statement and call tool_analyze_bank_statement to validate financial health before proceeding to underwriting.
   - If user provides a bank statement file path, IMMEDIATELY call tool_analyze_bank_statement.
9. DECISION - Based on underwriting status:
   - IF REJECTED: Explain the reason clearly (credit score, EMI affordability, etc.)
     * Call tool_archive_rejection with rejection reason
   - IF APPROVED: Inform user of their FINAL terms:
     * Show: final_interest_rate (risk-adjusted)
     * Show: final_tenure (risk-adjusted)
     * Show: final_emi
     * Show: risk_category (Excellent/Low/Medium/High Risk)
     * Explain how their credit profile affected the terms
10. SANCTION - Only if approved, ask: "Would you like the sanction letter?"
   - If yes: Call tool_generate_sanction with FINAL (risk-adjusted) rate and tenure
   - Dont metntion the path where the file is stored just say the sanction letter has been generated and will be sent to your registered email address
11. ALWAYS be polite, empathetic, and professional. Guide the user step-by-step.
12. If the application is rejected at any step, provide clear reasons and tell them to contact customer support and phone number 180067664 for further assistance with instructions on to provide bankstatements,kyc slips & salary slips.
IMPORTANT NOTES:
- ALWAYS use tool_sales_conversation for product questions, scheme inquiries, or loan details
-Dont use special characters like * or - for bullet points instead use simple text formatting
- The sales agent has specialized knowledge about government schemes (MUDRA, PMEGP, PMAY, etc.)
- DO NOT try to answer scheme-related questions yourself - use the sales agent tool
- The interest rate and tenure CAN CHANGE based on credit score
- Always present the FINAL terms from underwriting, not the initial offer
- Bank statements provide additional financial health insights (score 0-100)
- Handle natural language amounts: "fifty thousand" = 50000
- Be transparent about how risk-based pricing works

Be polite, guide step-by-step, and ALWAYS use the correct tools for their expertise.

EXAMPLES:
User: "I need 10 Lakhs but my salary is 50k."
Agent: "That is a high amount compared to your income. To proceed, I need to analyze your financial health. Please upload your last 6 months' bank statement."
User: "Here is the file: C:/docs/statement.pdf"
Agent: [Calls tool_analyze_bank_statement(file_path="C:/docs/statement.pdf")]"""

# === STATE DEFINITION ===
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    customer_id: str
    loan_id: int
    pre_approved_limit: int
    interest_rate: float
    requested_amount: int
    monthly_salary: int
    kyc_status: str
    underwriting_status: str
    bank_statement_score: Optional[int]  # NEW
    final_interest_rate: Optional[float]  # NEW - risk-adjusted rate
    final_tenure: Optional[int]  # NEW - risk-adjusted tenure
    final_emi: Optional[int]  # NEW
    risk_category: Optional[str]  # NEW

# === GRAPH NODES ===
async def call_model(state: AgentState):
    """Call the LLM with tools."""
    messages = state.get('messages', [])
    
    if not messages:
        error_msg = AIMessage(content="No messages in state.")
        return {"messages": [error_msg]}
    
    try:
        llm_with_tools = llm.bind_tools(tools)
        
        # Enhanced system context
        system_context = f"""Customer ID: {state.get('customer_id', 'unknown')}
Loan ID: {state.get('loan_id', 'unknown')}
Current State:
- Pre-approved limit: ${state.get('pre_approved_limit', 0)}
- Initial interest rate: {state.get('interest_rate', 0)}%
- Requested amount: ${state.get('requested_amount', 0)}
- Monthly salary: ${state.get('monthly_salary', 0)}
- KYC Status: {state.get('kyc_status', 'not_verified')}
- Underwriting Status: {state.get('underwriting_status', 'pending')}
- Bank Statement Score: {state.get('bank_statement_score', 'N/A')}
- Final Interest Rate: {state.get('final_interest_rate', 'N/A')}%
- Final Tenure: {state.get('final_tenure', 'N/A')} months
- Final EMI: ${state.get('final_emi', 'N/A')}
- Risk Category: {state.get('risk_category', 'N/A')}

CRITICAL INSTRUCTION: 
- When you receive a response from tool_sales_conversation, you MUST present the Necessary message to the user
- At first keep the response concise and to the point if the user asks more questions based on that provide detailed information at the same time dont overwhelm the customer by asking everthing at once.
-Remember to not give to big of a response at once be medium and be more interactive with the user
- Summarize  the sales agent's detailed scheme information if the user asks more based on how many times he asks give more detailed information.
- The sales agent provides comprehensive government scheme details that are valuable to the customer"""
        
        response = await llm_with_tools.ainvoke(messages)
        
        logger.info(f"LLM response: tool_calls={hasattr(response, 'tool_calls') and len(response.tool_calls) > 0}")
        return {"messages": [response]}
        
    except Exception as e:
        logger.error(f"Error calling LLM: {e}", exc_info=True)
        error_msg = AIMessage(content=f"Error: {str(e)}")
        return {"messages": [error_msg]}

async def call_tool(state: AgentState):
    """Execute tool calls from the LLM."""
    messages = state.get('messages', [])
    
    if not messages:
        return {"messages": []}
    
    last_message = messages[-1]
    
    if not isinstance(last_message, AIMessage) or not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
        return {"messages": []}
    
    tool_messages = []
    state_updates = {}
    
    for tool_call in last_message.tool_calls:
        tool_name = tool_call.get("name")
        tool_input = tool_call.get("args", {})
        tool_id = tool_call.get("id")
        
        logger.info(f"Executing tool: {tool_name} with input: {tool_input}")
        
        tool_func = next((t for t in tools if t.name == tool_name), None)
        
        if not tool_func:
            tool_messages.append(ToolMessage(
                content=f"Error: Unknown tool {tool_name}",
                tool_call_id=tool_id
            ))
            continue
        
        try:
            result = await tool_func.ainvoke(tool_input)
            
            logger.info(f"Tool {tool_name} result: {result}")
            
            # Update state based on tool results
            if tool_name == "tool_get_sales_offer":
                state_updates['pre_approved_limit'] = result.get('pre_approved_limit', 0)
                state_updates['interest_rate'] = result.get('interest_rate', 0)
            elif tool_name == "tool_verify_kyc":
                state_updates['kyc_status'] = result.get('kyc_status', 'failed')
            elif tool_name == "tool_analyze_bank_statement":
                state_updates['bank_statement_score'] = result.get('score', 0)
            elif tool_name == "tool_run_underwriting":
                state_updates['underwriting_status'] = result.get('status', 'failed')
                # Capture risk-adjusted terms
                if result.get('status') == 'approved':
                    state_updates['final_interest_rate'] = result.get('final_interest_rate')
                    state_updates['final_tenure'] = result.get('final_tenure')
                    state_updates['final_emi'] = result.get('final_emi')
                    state_updates['risk_category'] = result.get('risk_category')
            
            tool_messages.append(ToolMessage(
                content=json.dumps(result),
                tool_call_id=tool_id
            ))
            
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}", exc_info=True)
            tool_messages.append(ToolMessage(
                content=f"Error executing tool: {str(e)}",
                tool_call_id=tool_id
            ))
    
    return {"messages": tool_messages, **state_updates}

def should_continue(state: AgentState):
    """Route to tools or end based on last message."""
    messages = state.get('messages', [])
    
    if not messages:
        return END
    
    last_message = messages[-1]
    
    if isinstance(last_message, AIMessage) and hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        logger.info(f"Routing to tools: {len(last_message.tool_calls)} tool calls found")
        return "tools"
    
    logger.info("No tool calls detected, routing to END")
    return END

def save_chat_message_to_mongo(customer_id: str, loan_id: int, sender: str, message_text: str):
    """Save chat message to MongoDB"""
    if not mongo_client:
        return
    
    try:
        db = mongo_client[MONGO_DB_NAME]
        collection = db["chat_messages"]
        
        doc = {
            "customer_id": customer_id,
            "loan_id": loan_id,
            "sender": sender,
            "message_text": message_text,
            "timestamp": datetime.datetime.utcnow()
        }
        collection.insert_one(doc)
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")


# === HTTP CLIENT & GRAPH LIFECYCLE ===
@asynccontextmanager
async def lifespan(app: FastAPI):
    global app_http_client, app_graph, memory_saver, mongo_client
    
    app_http_client = httpx.AsyncClient(timeout=30.0)
    memory_saver = MemorySaver()
    
    # Setup MongoDB
    try:
        mongo_client = MongoClient(MONGO_URI)
        mongo_client.admin.command('ping')
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
    
    # Setup LangGraph workflow
    workflow = StateGraph(AgentState)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", call_tool)
    
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        },
    )
    workflow.add_edge("tools", "agent")
    
    app_graph = workflow.compile(checkpointer=memory_saver)
    logger.info("LangGraph workflow compiled successfully")
    
    yield
    
    await app_http_client.aclose()
    if mongo_client:
        mongo_client.close()

# === FASTAPI APP ===
app = FastAPI(title="Loan Chatbot - LangGraph", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "LangGraph Loan Chatbot is running"}

@app.get("/reset/{customer_id}")
async def reset_conversation(customer_id: str):
    """Reset conversation state for a customer."""
    global memory_saver
    try:
        if memory_saver and hasattr(memory_saver, '_storage'):
            memory_saver._storage.pop(customer_id, None)
            logger.info(f"Reset conversation for {customer_id}")
            return {"message": f"Conversation reset for {customer_id}"}
        return {"message": "Reset failed"}
    except Exception as e:
        logger.error(f"Error resetting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint with LangGraph."""
    
    global app_graph
    customer_id = request.customer_id
    message = request.message
    
    config = {"configurable": {"thread_id": customer_id}}
    lock = user_locks[customer_id]
    
    # Rate limiting
    now = time.time()
    request_times[customer_id] = [t for t in request_times[customer_id] if now - t < 60]
    
    if len(request_times[customer_id]) >= MAX_REQUESTS_PER_MINUTE:
        wait_time = 60 - (now - request_times[customer_id][0])
        return {
            "reply": f"Rate limit reached. Please wait {int(wait_time)} seconds."
        }
    
    request_times[customer_id].append(now)
    
    async with lock:
        try:
            # Check if first message
            try:
                current_state = await app_graph.aget_state(config)
                is_first = not (current_state and current_state.values and current_state.values.get('messages'))
            except:
                is_first = True
            
            # Define loan_id early so it's available for save_chat_message_to_mongo
            try:
                loan_id = int(customer_id)
            except ValueError:
                loan_id = abs(hash(customer_id)) % 1000000
            
            if is_first:
                user_content = f"{SYSTEM_PROMPT}\n\nCustomer ID: {customer_id}\n\nUser: {message}"
            else:
                user_content = message
            
            user_message = HumanMessage(content=user_content)
            save_chat_message_to_mongo(customer_id, loan_id, "user", message)
            input_state = {"messages": [user_message]}
            if is_first:
                
                input_state.update({
                    "customer_id": customer_id,
                    "loan_id": loan_id,
                    "pre_approved_limit": 0,
                    "interest_rate": 0.0,
                    "requested_amount": 0,
                    "monthly_salary": 0,
                    "kyc_status": "not_verified",
                    "underwriting_status": "pending",
                    "bank_statement_score": None,
                    "final_interest_rate": None,
                    "final_tenure": None,
                    "final_emi": None,
                    "risk_category": None
                })
            
            final_state = await app_graph.ainvoke(input_state, config=config)
            
            if final_state and final_state.get('messages'):
                last_msg = final_state['messages'][-1]
                content = last_msg.content if hasattr(last_msg, 'content') else str(last_msg)
                
                ai_reply = ""
                if isinstance(content, str):
                    ai_reply = content
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict):
                            if 'text' in block:
                                ai_reply += block['text']
                        elif isinstance(block, str):
                            ai_reply += block
                elif isinstance(content, dict):
                    if 'text' in content:
                        ai_reply = content['text']
                else:
                    ai_reply = str(content)
                save_chat_message_to_mongo(customer_id, loan_id, "bot", ai_reply)
                logger.info(f"Response to {customer_id}: {ai_reply[:100]}...")
                return {"reply": ai_reply}
            
            return {"reply": "No response generated"}
            
        except Exception as e:
            logger.error(f"Chat error for {customer_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# === ADMIN API ENDPOINTS ===

def get_pg_connection():
    try:
        conn = psycopg2.connect(**PG_DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Postgres connection error: {e}")
        return None

@app.get("/admin/customers")
async def get_all_customers():
    """Fetch all customers with their latest loan status."""
    conn = get_pg_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        # Fetch customers and join with latest loan status if available
        query = """
            SELECT 
                c.cust_id, c.name, c.age, c.gender, c.phone, c.address, 
                c.credit_score, c.pre_approved_limit, c.interest_options, 
                c.category, c.aadhaar,
                l.status as loan_status, l.approved_amount as loan_amount
            FROM customers c
            LEFT JOIN (
                SELECT DISTINCT ON (cust_id) cust_id, status, approved_amount 
                FROM loans 
                ORDER BY cust_id, created_at DESC
            ) l ON c.cust_id = l.cust_id
        """
        cursor.execute(query)
        customers = cursor.fetchall()
        return customers
    except Exception as e:
        logger.error(f"Error fetching customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/admin/customer/{cust_id}")
async def get_customer_detail(cust_id: str):
    """Fetch single customer details."""
    conn = get_pg_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM customers WHERE cust_id = %s", (cust_id,))
        customer = cursor.fetchone()
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
            
        # Get loans
        cursor.execute("SELECT * FROM loans WHERE cust_id = %s ORDER BY created_at DESC", (cust_id,))
        loans = cursor.fetchall()
        
        customer['loans'] = loans
        return customer
    except Exception as e:
        logger.error(f"Error fetching customer detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/admin/chat/{cust_id}")
async def get_chat_history(cust_id: str):
    """Fetch chat history from MongoDB."""
    if not mongo_client:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        db = mongo_client[MONGO_DB_NAME]
        collection = db["chat_messages"]
        
        # Determine loan_id (using the simple hashing logic from chat endpoint for consistency if needed, 
        # but ideally we should query by cust_id directly if possible. 
        # The save function uses cust_id, so we can query by it.)
        
        chats = list(collection.find({"customer_id": cust_id}).sort("timestamp", 1))
        
        # Convert ObjectId and datetime to string
        formatted_chats = []
        for chat in chats:
            formatted_chats.append({
                "id": str(chat.get("_id")),
                "cust_id": chat.get("customer_id"),
                "sender": chat.get("sender"),
                "message": chat.get("message_text"),
                "timestamp": chat.get("timestamp").isoformat() if chat.get("timestamp") else None
            })
            
        return formatted_chats
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)