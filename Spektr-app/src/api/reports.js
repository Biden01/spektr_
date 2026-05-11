import { api } from './client.js';

export const getOverview = () => api.get('/reports/overview');
export const getTestResultsReport = (days = 30) => api.get(`/reports/test-results?days=${days}`);
export const getSectionStats = () => api.get('/reports/section-stats');
export const getEmployeeActivity = (days = 30) => api.get(`/reports/employee-activity?days=${days}`);
export const getCategoryStats = () => api.get('/reports/category-stats');
