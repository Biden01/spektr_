import { api } from './client.js';

export const listProtocols = () => api.get('/protocols');
export const getProtocol = (id) => api.get(`/protocols/${id}`);
export const createProtocol = (data) => api.post('/protocols', data);
export const updateProtocol = (id, data) => api.put(`/protocols/${id}`, data);
export const deleteProtocol = (id) => api.delete(`/protocols/${id}`);
