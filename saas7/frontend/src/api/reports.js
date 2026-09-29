import api from './axios';

export const getSalesReport = (params) => api.get('/reports/sales', { params });
export const getCustomerReport = (params) => api.get('/reports/customers', { params });
export const getProductReport = (params) => api.get('/reports/products', { params });
export const getOrderReport = (params) => api.get('/reports/orders', { params });
export const exportReport = (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' });
