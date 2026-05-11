import { api } from './client.js';

export const listAlertRules = () => api.get('/alert-rules');
export const createAlertRule = (data) => api.post('/alert-rules', data);
export const updateAlertRule = (id, data) => api.put(`/alert-rules/${id}`, data);
export const deleteAlertRule = (id) => api.delete(`/alert-rules/${id}`);
