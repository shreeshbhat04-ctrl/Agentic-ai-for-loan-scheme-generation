# Run all loan agents + master agent in separate PowerShell windows
# SAVE THIS FILE IN: backend/run_all.ps1

$BASE_PATH = Get-Location
$VENV_PATH = "$BASE_PATH\venv\Scripts\Activate.ps1"

Write-Host "Base Path: $BASE_PATH"
Write-Host "Venv Path: $VENV_PATH"

# Function to start a uvicorn process in a new window
function Start-Agent {
    param(
        [string]$AgentPath, 
        [int]$Port, 
        [string]$AppString="main:app", # Default to main:app
        [string]$Title="Uvicorn Service"
    )
    
    # Construct the command to run in the new window
    # 1. Activate venv
    # 2. Change directory
    # 3. Run uvicorn (No --reload for stability)
    $Command = "& '$VENV_PATH'; cd '$AgentPath'; python -m uvicorn $AppString --port $Port"

    
    Write-Host "Launching $Title on port $Port..."
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "$Command" -WindowStyle Normal
}

Write-Host "Starting all agents..." -ForegroundColor Green

# --- 1. Master Agent ---
Start-Agent -AgentPath "$BASE_PATH\master_agent" -Port 8000 -Title "Master Agent"

# --- 2. Worker Agents ---
Start-Agent -AgentPath "$BASE_PATH\agents\sales_agent" -Port 8001 -Title "Sales Agent"
Start-Agent -AgentPath "$BASE_PATH\agents\verification_agent" -Port 8002 -Title "Verification Agent"
Start-Agent -AgentPath "$BASE_PATH\agents\underwriting_agent" -Port 8003 -Title "Underwriting Agent"
Start-Agent -AgentPath "$BASE_PATH\agents\sanction_generator" -Port 8004 -Title "Sanction Agent"
Start-Agent -AgentPath "$BASE_PATH\agents\doc_processor" -Port 8005 -Title "Doc Processor Agent"

# --- 3. Mock Services (Note specific App Strings) ---
Start-Agent -AgentPath "$BASE_PATH\mock_services\crm" -Port 9001 -AppString "main:app" -Title "Mock CRM"
Start-Agent -AgentPath "$BASE_PATH\mock_services\credit_bureau" -Port 9002 -AppString "main:app" -Title "Mock Credit Bureau"
Start-Agent -AgentPath "$BASE_PATH\mock_services\offer_mart" -Port 9003 -AppString "main:app" -Title "Mock Offer Mart"

Write-Host "`n✅ All 9 services are starting in separate windows!" -ForegroundColor Cyan