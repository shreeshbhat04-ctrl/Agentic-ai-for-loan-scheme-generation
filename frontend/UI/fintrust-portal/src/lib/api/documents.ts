/**
 * Document API Service
 * Handles document uploads and processing
 */

import { post, postFormData } from './client';
import { API_ENDPOINTS } from './config';

export interface SalaryVerificationRequest {
  file_path?: string;
}

export interface SalaryVerificationResponse {
  status: 'verified' | 'manual_review' | 'failed';
  monthly_salary: number | null;
  salary_source: string | null;
  document_type: string | null;
  confidence: number | null;
  error?: string;
}

export interface KYCProcessingResponse {
  status: string;
  customer_id: string;
  name: string | null;
  aadhaar: string | null;
  pan: string | null;
}

/**
 * Upload and verify salary document
 */
export async function verifySalaryDocument(
  file: File
): Promise<SalaryVerificationResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return postFormData<SalaryVerificationResponse>(
    API_ENDPOINTS.DOC_VERIFY_SALARY,
    formData
  );
}

/**
 * Process KYC document (for new customer registration)
 */
export async function processKYCDocument(
  filePath: string
): Promise<KYCProcessingResponse> {
  return post<KYCProcessingResponse>(API_ENDPOINTS.DOC_PROCESS_KYC, {
    file_path: filePath,
  });
}

