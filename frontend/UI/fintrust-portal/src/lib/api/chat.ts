/**
 * Chat API Service
 * Handles communication with the Master Agent for loan chatbot
 */

import { post, get } from './client';
import { API_ENDPOINTS } from './config';

export interface ChatRequest {
  customer_id: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ChatMessage {
  id: string;
  cust_id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
}

/**
 * Send a chat message to the AI assistant
 */
export async function sendChatMessage(
  customerId: string,
  message: string
): Promise<ChatResponse> {
  return post<ChatResponse>(API_ENDPOINTS.CHAT, {
    customer_id: customerId,
    message,
  });
}

/**
 * Reset conversation for a customer
 */
export async function resetConversation(
  customerId: string
): Promise<{ message: string }> {
  return get<{ message: string }>(API_ENDPOINTS.RESET_CHAT(customerId));
}

/**
 * Get chat history for a customer
 */
export async function getChatHistory(
  customerId: string
): Promise<ChatMessage[]> {
  return get<ChatMessage[]>(API_ENDPOINTS.ADMIN_CHAT(customerId));
}

