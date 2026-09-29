import api from './axios';

export const getCompare = () => api.get('/compare');
export const addCompare = (productId) => api.post('/compare', { productId });
export const removeCompare = (productId) => api.delete(`/compare/${productId}`);
export const clearCompare = () => api.delete('/compare');
