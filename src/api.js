import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

export const getMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const submitOrder = async (orderData) => {
  const response = await api.post('/order', orderData);
  return response.data;
};