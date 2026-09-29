import api from './axios';

export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const getCustomerByUserId = (userId) => api.get(`/customers/user/${userId}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const getCustomerOrders = (id) => api.get(`/customers/${id}/orders`);
export const searchCustomers = (query) => api.get('/customers/search', { params: { query } });
export const getTopCustomers = () => api.get('/customers/top');