import { api } from './client.js';

export async function loginWithPassword(identifier, password) {
  const data = await api.post('/auth/login', { identifier, password });
  localStorage.setItem('spektr-token', data.access_token);
  localStorage.setItem('spektr-refresh', data.refresh_token);
  return data.user;
}

export async function getMe() {
  return api.get('/auth/me');
}

export async function logoutApi() {
  await api.post('/auth/logout').catch(() => {});
  localStorage.removeItem('spektr-token');
  localStorage.removeItem('spektr-refresh');
}
