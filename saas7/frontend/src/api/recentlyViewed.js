import api from './axios';

export const getRecentlyViewed = () => api.get('/recently-viewed');
export const addRecentlyViewed = (productId) => api.post('/recently-viewed', { productId });
export const clearRecentlyViewed = () => api.delete('/recently-viewed');
