import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const refresh = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password });
export const changePassword = (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword });
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);
export const sendVerification = () => api.post('/auth/send-verification');
export const logout = () => api.post('/auth/logout');







// 1	frontend/src/pages/Home.jsx	To see current structure and where to insert category section.
// 2	frontend/src/pages/Products.jsx	To understand existing filtering/sorting and integrate category filter.
// 3	frontend/src/api/categories.js	Verify getCategories function exists and returns expected data.
// 4	frontend/src/components/products/ProductGrid.jsx	To see how products are displayed (reuse for categories).
// 5	backend/src/models/Category.js	Confirm fields (especially image, description, slug).
// 6	backend/src/controllers/categoryController.js	Ensure getCategories returns all necessary fields.
// 7	frontend/src/api/products.js	Check if it supports category filter in getProducts params.





