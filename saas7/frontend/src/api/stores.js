import api from './axios';

// Common store endpoints
export const getStores = (params) => api.get('/stores/all', { params });
export const getStore = (id) => api.get(`/stores/${id}`);
export const createStore = (data) => api.post('/stores', data);
export const updateStore = (id, data) => api.put(`/stores/${id}`, data);
export const deleteStore = (id) => api.delete(`/stores/${id}`);
export const suspendStore = (id) => api.post(`/stores/${id}/suspend`);
export const activateStore = (id) => api.post(`/stores/${id}/activate`);
export const getStoreStats = (id) => api.get(`/stores/${id}/stats`);
export const getOwnerDashboard = () => api.get('/owner/dashboard');

// ✅ Super Admin specific APIs (used in StoreDetail, StoreAnalytics, etc.)
export const getStoreDetails = (id) => api.get(`/owner/stores/${id}`);
export const getStoreAnalytics = (id) => api.get(`/owner/stores/${id}/analytics`);
export const resetAdminPassword = (id) => api.post(`/owner/stores/${id}/reset-password`);
export const updatePaymentGateway = (data) => api.post('/stores/payment-gateway', data);
