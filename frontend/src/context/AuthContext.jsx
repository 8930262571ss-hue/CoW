import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('cow_access_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          localStorage.removeItem('cow_access_token');
          localStorage.removeItem('cow_refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem('cow_access_token', data.access_token);
    localStorage.setItem('cow_refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone, role = 'customer') => {
    const data = await api.register({ name, email, password, phone, role });
    localStorage.setItem('cow_access_token', data.access_token);
    localStorage.setItem('cow_refresh_token', data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('cow_access_token');
    localStorage.removeItem('cow_refresh_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
