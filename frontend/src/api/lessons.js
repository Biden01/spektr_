import { api } from './client.js';

export const listLessons = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/lessons${q ? '?' + q : ''}`);
};
export const createLesson = (data) => api.post('/lessons', data);
export const updateLesson = (id, data) => api.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => api.delete(`/lessons/${id}`);
