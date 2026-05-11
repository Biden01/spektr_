import { api } from './client.js';

export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.post('/notifications/read-all');
export const sendNotification = (data) => api.post('/notifications', data);
export const sendBulkNotification = (data) => api.post('/notifications/bulk', data);
