import { api } from './client.js';

export function startTest(type, opts = {}) {
  return api.post('/tests/start', { type, ...opts });
}

export function submitTest(sessionToken, answers, durationSec) {
  return api.post(`/tests/${sessionToken}/submit`, {
    answers,
    duration_sec: durationSec,
  });
}

export function getTestHistory(skip = 0, limit = 50) {
  return api.get(`/tests/history?skip=${skip}&limit=${limit}`);
}

export function getDailyStatus() {
  return api.get('/tests/daily/status');
}
