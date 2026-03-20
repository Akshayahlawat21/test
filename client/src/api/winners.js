import api from './axios';

export const uploadProof = (drawId, data) =>
  api.post(`/winners/${drawId}/upload-proof`, data);

export const getMyWinnings = () => api.get('/winners/my-winnings');
