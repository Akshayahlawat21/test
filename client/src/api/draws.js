import api from './axios';

export const getCurrentDraw = () => api.get('/draws/current');
export const getDrawHistory = (params) => api.get('/draws/history', { params });
export const getDrawById = (id) => api.get(`/draws/${id}`);
export const getMyResults = () => api.get('/draws/my-results');
