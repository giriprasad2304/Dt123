import axios from 'axios';
import { MenuItem, OrderFormData } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const getMenu = async (): Promise<MenuItem[]> => {
  const response = await api.get('/menu');
  return response.data;
};

export const submitOrder = async (orderData: OrderFormData) => {
  const response = await api.post('/order', orderData);
  return response.data;
};