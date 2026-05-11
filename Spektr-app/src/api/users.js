import { api } from './client.js';

export const listUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/users${q ? '?' + q : ''}`);
};
export const getSections = () => api.get('/users/sections');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
