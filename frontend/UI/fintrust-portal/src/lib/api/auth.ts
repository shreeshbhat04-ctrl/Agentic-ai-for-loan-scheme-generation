/**
 * Authentication API Service
 * Handles login, registration, and customer data retrieval
 */

import { post, get } from './client';
import { API_ENDPOINTS } from './config';

export interface LoginRequest {
  custId: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  name: string;
  custId: string;
  credit_score: number;
}

export interface RegisterRequest {
  name: string;
  age: string;
  city: string;
  phone: string;
  address: string;
  aadhar: string;
  password: string;
}

export interface RegisterResponse {
  status: string;
  custId: string;
}

export interface CustomerKYC {
  custId: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  aadhaar: string;
  credit_score: number | null;
  category: string | null;
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>(API_ENDPOINTS.CRM_LOGIN, credentials);
}

/**
 * Register new user
 */
export async function register(
  userData: RegisterRequest
): Promise<RegisterResponse> {
  return post<RegisterResponse>(API_ENDPOINTS.CRM_REGISTER, userData);
}

/**
 * Get customer KYC data
 */
export async function getCustomerKYC(
  customerId: string
): Promise<CustomerKYC> {
  return get<CustomerKYC>(API_ENDPOINTS.CRM_GET_CUSTOMER(customerId));
}

