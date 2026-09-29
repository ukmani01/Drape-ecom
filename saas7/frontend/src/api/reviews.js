import api from './axios';

export const getReviews = (params) => api.get('/reviews', { params });
export const getReview = (id) => api.get(`/reviews/${id}`);
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const approveReview = (id) => api.patch(`/reviews/${id}/approve`);
export const rejectReview = (id) => api.patch(`/reviews/${id}/reject`);
