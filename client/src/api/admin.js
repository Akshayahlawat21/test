import api from './axios';

// Users
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Draws
export const createDraw = (data) => api.post('/admin/draws', data);
export const updateDraw = (id, data) => api.put(`/admin/draws/${id}`, data);
export const executeDraw = (id) => api.post(`/admin/draws/${id}/execute`);
export const getAllDraws = (params) => api.get('/admin/draws', { params });
export const simulateDraw = (data) => api.post('/admin/draws/simulate', data);
export const publishDraw = (id) => api.post(`/admin/draws/publish/${id}`);
export const configDraw = (id, data) => api.put(`/admin/draws/${id}/config`, data);

// Charities
export const getAdminCharities = () => api.get('/admin/charities');
export const adminCreateCharity = (data) => api.post('/admin/charities', data);
export const adminUpdateCharity = (id, data) => api.put(`/admin/charities/${id}`, data);
export const adminDeleteCharity = (id) => api.delete(`/admin/charities/${id}`);
// Legacy aliases
export const createCharity = adminCreateCharity;
export const updateCharity = adminUpdateCharity;
export const deleteCharity = adminDeleteCharity;

// Winners
export const getWinners = (params) => api.get('/admin/winners', { params });
export const getPendingWinners = () => api.get('/admin/winners', { params: { status: 'pending' } });
export const verifyWinner = (drawId, resultId, data) =>
  api.put(`/admin/winners/${drawId}/${resultId}/verify`, data);
export const payoutWinner = (drawId, resultId) =>
  api.put(`/admin/winners/${drawId}/${resultId}/payout`);

// Reports
export const getReports = () => api.get('/admin/reports');
export const getRevenueReport = (params) => api.get('/admin/reports/revenue', { params });
export const getDonationReport = (params) => api.get('/admin/reports/donations', { params });
export const getUserReport = (params) => api.get('/admin/reports/users', { params });
export const getDashboardStats = () => api.get('/admin/reports');
