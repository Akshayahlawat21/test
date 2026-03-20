import api from './axios';

export const getCharities = (params) => api.get('/charities', { params });
export const getCharity = (slug) => api.get(`/charities/${slug}`);
export const updateUserCharity = (data) => api.put('/charities/user/charity', data);
export const createDonation = (data) => api.post('/charities/donations', data);
// Admin
export const createCharity = (data) => api.post('/charities/admin', data);
export const updateCharity = (id, data) => api.put(`/charities/admin/${id}`, data);
export const deleteCharity = (id) => api.delete(`/charities/admin/${id}`);
