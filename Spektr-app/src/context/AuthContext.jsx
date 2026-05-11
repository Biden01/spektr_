import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginWithPassword, getMe, logoutApi } from '../api/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session via /auth/me
  useEffect(() => {
    const token = localStorage.getItem('spektr-token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(u => setUser(normalizeUser(u)))
      .catch(() => {
        localStorage.removeItem('spektr-token');
        localStorage.removeItem('spektr-refresh');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier, password) => {
    const u = await loginWithPassword(identifier, password);
    setUser(normalizeUser(u));
    return u;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const u = await getMe();
      setUser(normalizeUser(u));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

// Normalize backend user shape to what the UI expects
function normalizeUser(u) {
  return {
    id: u.id,
    fullName: u.full_name,
    initials: u.initials || initials(u.full_name),
    tabNumber: u.tab_number || String(u.id),
    role: u.role,
    position: u.position || '',
    section: u.section || '',
    accessGroup: u.access_group || '',
    phone: u.phone || '',
    email: u.email || '',
    state: u.state || 'all_ok',
    dailyDoneToday: u.daily_done_today || false,
    annualDueDays: u.annual_due_days ?? null,
    medicalDueDays: u.medical_due_days ?? null,
    photoUrl: u.photo_url || null,
    slug: u.slug || '',
    achievements: u.achievements || [],
  };
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2).toUpperCase();
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
