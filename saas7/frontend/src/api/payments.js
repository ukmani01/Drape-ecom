import api from './axios';

export const createRazorpayOrder = (data) => api.post('/payments/create-order', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);
export const capturePayment = (data) => api.post('/payments/capture', data);
