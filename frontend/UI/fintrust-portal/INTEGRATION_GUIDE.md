# Frontend-Backend Integration Guide

This document describes the integration between the FinTrust Portal frontend and the backend services.

## Overview

The frontend has been fully integrated with the backend microservices architecture. All API calls are now connected to the actual backend services instead of using mock data.

## Architecture

### API Service Layer

All API interactions are handled through a centralized service layer located in `src/lib/api/`:

- **`config.ts`** - API endpoint configuration and base URLs
- **`client.ts`** - HTTP client with error handling
- **`auth.ts`** - Authentication API (login, registration, customer KYC)
- **`chat.ts`** - Chat API for AI Assistant
- **`documents.ts`** - Document upload and processing
- **`customer.ts`** - Customer and loan data retrieval

### Authentication Context

- **`src/contexts/AuthContext.tsx`** - Global authentication state management
- Provides `useAuth()` hook for accessing user data throughout the app
- Persists user session in localStorage

## Integrated Features

### 1. Login Page (`/login`)
- ✅ Integrated with CRM service (`http://127.0.0.1:9001/login`)
- ✅ Password-based authentication (replaced OTP flow)
- ✅ Stores user session in context and localStorage
- ✅ Redirects to dashboard on successful login

### 2. AI Assistant Page (`/ai-assistant`)
- ✅ Integrated with Master Agent chat API (`http://127.0.0.1:8000/chat`)
- ✅ Real-time chat with LangGraph-powered AI
- ✅ Document upload support (salary slips, bank statements)
- ✅ Conversation reset functionality
- ✅ Authentication check - requires login to use

### 3. Dashboard Page (`/dashboard`)
- ✅ Fetches customer data from admin API (`http://127.0.0.1:8000/admin/customer/{custId}`)
- ✅ Displays real loan information from PostgreSQL
- ✅ Shows loan status, amounts, interest rates, tenure
- ✅ Logout functionality

## Environment Configuration

Create a `.env` file in the `frontend/UI/fintrust-portal/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_CRM_SERVICE_URL=http://127.0.0.1:9001
VITE_DOC_PROCESSOR_URL=http://127.0.0.1:8005
```

## API Endpoints Used

### Master Agent (Port 8000)
- `POST /chat` - Send chat messages
- `GET /reset/{customer_id}` - Reset conversation
- `GET /admin/customers` - List all customers
- `GET /admin/customer/{cust_id}` - Get customer details with loans
- `GET /admin/chat/{cust_id}` - Get chat history

### CRM Service (Port 9001)
- `POST /login` - Customer login
- `POST /register` - Customer registration
- `GET /crm/{customer_id}` - Get customer KYC data

### Document Processor (Port 8005)
- `POST /verify_salary_upload` - Upload and verify salary document
- `POST /process_kyc_doc` - Process KYC documents

## Usage Instructions

### 1. Start Backend Services

Make sure all backend services are running:

```powershell
cd backend
.\run_all.ps1
```

This starts:
- Master Agent (8000)
- Sales Agent (8001)
- Verification Agent (8002)
- Underwriting Agent (8003)
- Sanction Generator (8004)
- Document Processor (8005)
- CRM Service (9001)
- Credit Bureau (9002)
- Offer Mart (9003)

### 2. Configure Frontend Environment

```bash
cd frontend/UI/fintrust-portal
cp .env.example .env
# Edit .env with your API URLs if different
```

### 3. Install Dependencies (if not already done)

```bash
npm install
# or
bun install
```

### 4. Start Frontend Development Server

```bash
npm run dev
# or
bun dev
```

The frontend will be available at `http://localhost:8080`

## Testing the Integration

### 1. Test Login
1. Navigate to `/login`
2. Use a customer ID from your database (e.g., from `backend/db/synthetic.json`)
3. Enter the password (check database for actual password)
4. Should redirect to dashboard on success

### 2. Test AI Assistant
1. Login first
2. Navigate to `/ai-assistant`
3. Send a message like "I need a loan"
4. Should receive real AI responses from the Master Agent
5. Try uploading a salary slip PDF

### 3. Test Dashboard
1. After login, should see customer data
2. View loan information if available
3. Check loan status and details

## Error Handling

All API calls include comprehensive error handling:
- Network errors are caught and displayed to users
- API errors show user-friendly messages
- Loading states are shown during API calls
- Toast notifications for success/error feedback

## Future Enhancements

Potential improvements:
1. Add WebSocket support for real-time chat updates
2. Implement file preview before upload
3. Add progress indicators for document processing
4. Implement refresh tokens for better security
5. Add request retry logic for failed API calls
6. Add offline mode support

## Troubleshooting

### CORS Errors
- Ensure backend services have CORS enabled (already configured in FastAPI)
- Check that API URLs in `.env` match your backend ports

### Authentication Issues
- Clear localStorage if login fails
- Check that customer exists in database
- Verify password in database matches

### API Connection Errors
- Verify all backend services are running
- Check network connectivity
- Review browser console for detailed error messages

## Notes

- The frontend uses React Query for data fetching and caching
- All API calls are typed with TypeScript interfaces
- Error messages are user-friendly and actionable
- Loading states provide good UX during API calls

