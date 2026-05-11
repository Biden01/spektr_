import { api } from './client.js';

export const getRecentEvents = (n = 10) => api.get(`/events/recent?n=${n}`);
