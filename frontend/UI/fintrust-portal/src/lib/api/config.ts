/**
 * API Configuration
 * Centralized configuration for all backend API endpoints
 */

// API Base URLs - Update these based on your environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const CRM_SERVICE_URL = import.meta.env.VITE_CRM_SERVICE_URL || 'http://127.0.0.1:9001';
const DOC_PROCESSOR_URL = import.meta.env.VITE_DOC_PROCESSOR_URL || 'http://127.0.0.1:8005';

export const API_ENDPOINTS = {
  // Master Agent (Main Chat API)
  CHAT: `${API_BASE_URL}/chat`,
  RESET_CHAT: (customerId: string) => `${API_BASE_URL}/reset/${customerId}`,
  
  // Admin/Customer APIs
  ADMIN_CUSTOMERS: `${API_BASE_URL}/admin/customers`,
  ADMIN_CUSTOMER: (custId: string) => `${API_BASE_URL}/admin/customer/${custId}`,
  ADMIN_CHAT: (custId: string) => `${API_BASE_URL}/admin/chat/${custId}`,
  
  // CRM Service (Authentication)
  CRM_LOGIN: `${CRM_SERVICE_URL}/login`,
  CRM_REGISTER: `${CRM_SERVICE_URL}/register`,
  CRM_GET_CUSTOMER: (customerId: string) => `${CRM_SERVICE_URL}/crm/${customerId}`,
  
  // Document Processor
  DOC_VERIFY_SALARY: `${DOC_PROCESSOR_URL}/verify_salary_upload`,
  DOC_PROCESS_KYC: `${DOC_PROCESSOR_URL}/process_kyc_doc`,
} as const;

/**
 * Default fetch options
 */
export const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'omit',
};

/**
 * Create fetch options with custom headers
 */
export function createFetchOptions(options: RequestInit = {}): RequestInit {
  return {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  };
}

