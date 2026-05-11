import { api } from './client.js';

export const listMechanisms = (params = {}) => api.get('/mechanisms', { params });
export const getMechanism = (id) => api.get(`/mechanisms/${id}`);
export const createMechanism = (data) => api.post('/mechanisms', data);
export const updateMechanism = (id, data) => api.put(`/mechanisms/${id}`, data);
export const deleteMechanism = (id) => api.delete(`/mechanisms/${id}`);
