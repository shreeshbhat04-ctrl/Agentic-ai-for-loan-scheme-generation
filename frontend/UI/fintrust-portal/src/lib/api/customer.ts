/**
 * Customer API Service
 * Handles customer data and loan information
 */

import { get } from './client';
import { API_ENDPOINTS } from './config';

export interface Customer {
  cust_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  credit_score: number;
  pre_approved_limit: number;
  interest_options: string[];
  category: string;
  aadhaar: string;
  loan_status?: string;
  loan_amount?: number;
}

export interface CustomerDetail extends Customer {
  loans: Loan[];
}

export interface Loan {
  loan_id: number;
  cust_id: string;
  requested_amount: number;
  approved_amount: number;
  status: string;
  reason: string | null;
  interest_rate: number;
  tenure_months: number;
  sanction_letter_path: string | null;
  salary_slip_path: string | null;
  kyc_doc_path: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all customers (admin endpoint)
 */
export async function getAllCustomers(): Promise<Customer[]> {
  return get<Customer[]>(API_ENDPOINTS.ADMIN_CUSTOMERS);
}

/**
 * Get customer details with loans
 */
export async function getCustomerDetail(
  customerId: string
): Promise<CustomerDetail> {
  return get<CustomerDetail>(API_ENDPOINTS.ADMIN_CUSTOMER(customerId));
}

