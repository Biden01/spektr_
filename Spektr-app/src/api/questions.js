import { api } from './client.js';

export const listQuestions = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/questions${q ? '?' + q : ''}`);
};
export const createQuestion = (data) => api.post('/questions', data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);
