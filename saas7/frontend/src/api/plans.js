import api from './axios';

export const getPlans = () => api.get('/subscriptions/plans');