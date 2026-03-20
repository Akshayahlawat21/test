import api from './axios';

export const getScores = () => api.get('/scores');
export const addScore = (data) => api.post('/scores', data);
export const updateScore = (id, data) => api.put(`/scores/${id}`, data);
export const deleteScore = (id) => api.delete(`/scores/${id}`);
