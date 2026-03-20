import api from './axios';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const refreshToken = () => api.post('/auth/refresh');
export const getMe = () => api.get('/auth/me');
export const logoutUser = () => api.post('/auth/logout');
