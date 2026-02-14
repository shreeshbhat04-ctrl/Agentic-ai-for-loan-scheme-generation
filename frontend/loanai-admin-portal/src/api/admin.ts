import axios from 'axios';
import { Customer, ChatMessage } from '@/data/customers';

// Use the master_agent URL (default 8000)
const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_URL,
});

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await api.get('/admin/customers');
    return response.data;
};

export const getCustomerDetail = async (custId: string): Promise<Customer> => {
    const response = await api.get(`/admin/customer/${custId}`);
    return response.data;
};

export const getChatHistory = async (custId: string): Promise<ChatMessage[]> => {
    const response = await api.get(`/admin/chat/${custId}`);
    return response.data;
};
