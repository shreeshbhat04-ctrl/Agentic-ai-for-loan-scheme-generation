/**
 * API Client
 * Centralized HTTP client with error handling and response parsing
 */

import { API_ENDPOINTS, createFetchOptions } from './config';

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

export class ApiClientError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, createFetchOptions(options));

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new ApiClientError(
          `Request failed with status ${response.status}`,
          response.status
        );
      }
      return response.text() as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiClientError(
        data.detail || data.message || 'Request failed',
        response.status,
        data.detail
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or other errors
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

/**
 * GET request
 */
export async function get<T>(url: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * POST request with FormData (for file uploads)
 */
export async function postFormData<T>(
  url: string,
  formData: FormData,
  options?: RequestInit
): Promise<T> {
  const fetchOptions = createFetchOptions({
    ...options,
    method: 'POST',
    body: formData,
  });

  // Remove Content-Type header to let browser set it with boundary
  if (fetchOptions.headers) {
    const headers = new Headers(fetchOptions.headers);
    headers.delete('Content-Type');
    fetchOptions.headers = headers;
  }

  return apiRequest<T>(url, fetchOptions);
}

/**
 * PUT request
 */
export async function put<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T>(url: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

