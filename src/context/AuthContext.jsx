import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hireiq_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hireiq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('hireiq_token');
      if (savedToken) {
        try {
          const res = await authApi.getProfile();
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('hireiq_user', JSON.stringify(res.data));
            localStorage.setItem('isAuthenticated', 'true');
          }
        } catch {
          // Token expired or invalid
          logout();
        }
      } else {
        localStorage.setItem('isAuthenticated', 'false');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.data?.accessToken) {
      localStorage.setItem('hireiq_token', res.data.accessToken);
      localStorage.setItem('hireiq_refresh', res.data.refreshToken);
      localStorage.setItem('hireiq_user', JSON.stringify(res.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Login failed: token not returned');
  };

  const signup = async (userData) => {
    const res = await authApi.register(userData);
    if (res.data?.accessToken) {
      localStorage.setItem('hireiq_token', res.data.accessToken);
      localStorage.setItem('hireiq_refresh', res.data.refreshToken);
      localStorage.setItem('hireiq_user', JSON.stringify(res.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      setToken(res.data.accessToken);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error('Signup failed: token not returned');
  };

  const logout = () => {
    const refresh = localStorage.getItem('hireiq_refresh');
    if (refresh) {
      authApi.logout(refresh).catch(() => {});
    }
    localStorage.removeItem('hireiq_token');
    localStorage.removeItem('hireiq_refresh');
    localStorage.removeItem('hireiq_user');
    localStorage.setItem('isAuthenticated', 'false');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData };
    setUser(updated);
    localStorage.setItem('hireiq_user', JSON.stringify(updated));
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
