import api from './axios';

export const getActivityLogs = (params) => api.get('/activity', { params });
export const getActivityById = (id) => api.get(`/activity/${id}`);
