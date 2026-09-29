import api from './axios';

export const getAnalytics = (params) => api.get('/analytics', { params });
export const getSalesReport = (params) => api.get('/analytics/sales', { params });
export const getProductAnalytics = (params) => api.get('/analytics/products', { params });
export const getCustomerAnalytics = (params) => api.get('/analytics/customers', { params });
