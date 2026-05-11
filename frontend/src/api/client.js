const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('spektr-token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Try refresh
    const refreshToken = localStorage.getItem('spektr-refresh');
    if (refreshToken) {
      const rr = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (rr.ok) {
        const rd = await rr.json();
        localStorage.setItem('spektr-token', rd.access_token);
        headers['Authorization'] = `Bearer ${rd.access_token}`;
        const retry = await fetch(`${BASE}${path}`, {
          method,
          headers,
          body: body != null ? JSON.stringify(body) : undefined,
        });
        if (!retry.ok) throw new Error(`${retry.status}`);
        return retry.json();
      }
    }
    localStorage.removeItem('spektr-token');
    localStorage.removeItem('spektr-refresh');
    localStorage.removeItem('spektr-user');
    window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};
