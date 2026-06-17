import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, setAccessToken, setUnauthorizedHandler } from '@/src/lib/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'ops' | 'rsm' | 'rep' | 'sdr';
  territory: string | null;
  territory_id: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  impersonating: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loginAs: (userId: string) => Promise<void>;
  returnToAdmin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_TOKEN_KEY = 'apex_refresh_token';
const ADMIN_REFRESH_TOKEN_KEY = 'apex_admin_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setImpersonating(false);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const scheduleRefresh = useCallback((expiresInMs: number) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const delay = Math.max(expiresInMs - 60_000, 5_000);
    refreshTimer.current = setTimeout(async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) { clearAuth(); return; }
      try {
        const res = await api.post<{ access_token: string }>('/auth/refresh', { refresh_token: refreshToken });
        setAccessToken(res.access_token);
        scheduleRefresh(55 * 60 * 1000);
      } catch {
        clearAuth();
      }
    }, delay);
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; refresh_token: string; user: AuthUser }>(
      '/auth/login',
      { email, password },
    );
    setAccessToken(res.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
    setUser(res.user);
    setImpersonating(false);
    scheduleRefresh(55 * 60 * 1000);
  }, [scheduleRefresh]);

  const loginAs = useCallback(async (userId: string) => {
    const res = await api.post<{ access_token: string; refresh_token: string; user: AuthUser }>(
      `/auth/impersonate/${userId}`,
      {},
    );
    // Stash the current admin refresh token so we can return
    const currentToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (currentToken) localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, currentToken);
    setAccessToken(res.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token);
    setUser(res.user);
    setImpersonating(true);
    scheduleRefresh(55 * 60 * 1000);
  }, [scheduleRefresh]);

  const returnToAdmin = useCallback(async () => {
    const adminToken = localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    if (!adminToken) { clearAuth(); return; }
    try {
      const res = await api.post<{ access_token: string }>('/auth/refresh', { refresh_token: adminToken });
      setAccessToken(res.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, adminToken);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      const me = await api.get<AuthUser>('/auth/me');
      setUser(me);
      setImpersonating(false);
      scheduleRefresh(55 * 60 * 1000);
    } catch {
      clearAuth();
    }
  }, [clearAuth, scheduleRefresh]);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    const restoreSession = async () => {
      if (refreshToken) {
        try {
          const res = await api.post<{ access_token: string }>('/auth/refresh', { refresh_token: refreshToken });
          setAccessToken(res.access_token);
          scheduleRefresh(55 * 60 * 1000);
          const me = await api.get<AuthUser>('/auth/me');
          setUser(me);
          // Restore impersonation flag if admin token is also stored
          if (localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY)) setImpersonating(true);
          return;
        } catch {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }

      try {
        const me = await api.get<AuthUser>('/auth/me');
        setUser(me);
      } catch {
        // Auth required — show login screen
      }
    };

    restoreSession().finally(() => setIsLoading(false));

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, isLoading, impersonating, login, logout, loginAs, returnToAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
