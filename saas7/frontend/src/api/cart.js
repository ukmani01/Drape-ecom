import api from './axios';

export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateCartItem = (data) => api.put('/cart/item', data);
export const removeFromCart = (productId) => api.delete(`/cart/item/${productId}`);
export const clearCart = () => api.delete('/cart/clear');
export const mergeGuestCart = (guestCart) => api.post('/cart/merge', { guestCart });
