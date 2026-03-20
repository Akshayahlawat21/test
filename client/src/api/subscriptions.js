import api from './axios';

export const createCheckoutSession = (plan) => api.post('/subscriptions/create-checkout', { plan });
export const getSubscriptionStatus = () => api.get('/subscriptions/status');
export const cancelSubscription = () => api.post('/subscriptions/cancel');
export const reactivateSubscription = () => api.post('/subscriptions/reactivate');
