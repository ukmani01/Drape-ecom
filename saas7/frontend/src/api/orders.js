import api from './axios';

export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getOrderByOrderId = (orderId) => api.get(`/orders/by-order-id/${orderId}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrderStatus = (id, status, note) => api.put(`/orders/${id}/status`, { status, note });
export const getOrderTimeline = (id) => api.get(`/orders/${id}/timeline`);
export const getOrderStats = (params) => api.get('/orders/stats', { params });
