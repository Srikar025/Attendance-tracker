import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Optimistic init: read synchronously from localStorage so the app never
  // shows a blank screen / spinner on a normal page reload.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  // isLoading is only true while we haven't yet resolved the token check.
  // If there is no token we resolve immediately (false); if there is a token
  // we stay true until getMe finishes (or we skip it after a fresh login).
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem('token'));

  // Flag set by login() so the validation useEffect knows to skip getMe —
  // the data is already fresh from the login response.
  const skipGetMeRef = useRef(false);

  const login = useCallback((newToken: string, newUser: User) => {
    skipGetMeRef.current = true; // signal: do NOT call getMe for this session start
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false); // already have fresh data — no network call needed
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  // On mount: validate stored token via GET /auth/me ONLY when the app is
  // loaded fresh (browser refresh / cold open). Skipped after a login().
  useEffect(() => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) {
      // No token at all — resolve immediately, no network call.
      setIsLoading(false);
      return;
    }

    if (skipGetMeRef.current) {
      // login() was just called — user data is already fresh, skip the call.
      skipGetMeRef.current = false;
      setIsLoading(false);
      return;
    }

    // App loaded with a stored token (e.g. browser refresh). Validate it.
    authService.getMe()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token is invalid/expired — clear everything.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // runs once on mount only

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
