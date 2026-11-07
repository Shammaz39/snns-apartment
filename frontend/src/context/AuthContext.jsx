import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('snns_user');
    const token = localStorage.getItem('snns_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('snns_user');
        localStorage.removeItem('snns_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const authData = res.data;
    localStorage.setItem('snns_token', authData.token);
    localStorage.setItem('snns_user', JSON.stringify(authData));
    setUser(authData);
    return authData;
  };

  const logout = () => {
    localStorage.removeItem('snns_token');
    localStorage.removeItem('snns_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isSecurity = user?.role === 'ROLE_SECURITY';
  const isResident = user?.role === 'ROLE_RESIDENT' || user?.role === 'ROLE_SUBTENANT';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isSecurity, isResident, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
