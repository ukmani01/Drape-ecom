import api from './axios';

export const getSubscription = () => api.get('/subscriptions');
export const createSubscription = (data) => api.post('/subscriptions', data);
export const renewSubscription = (data) => api.post('/subscriptions/renew', data);
export const cancelSubscription = () => api.post('/subscriptions/cancel');
export const upgradePlan = (planId) => api.post('/subscriptions/upgrade', { planId });
export const getSubscriptionStatus = () => api.get('/subscriptions/status');
export const getPlans = () => api.get('/subscriptions/plans');

// ========== 🔥 NEW: RAZORPAY PAYMENT APIs ==========
export const createRazorpayOrder = (data) => api.post('/payments/create-order', data);
export const verifyRazorpayPayment = (data) => api.post('/payments/verify', data);
// ====================================================