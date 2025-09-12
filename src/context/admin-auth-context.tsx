
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type AdminAuthContextType = {
  isAdminAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  loading: boolean;
};

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  login: () => false,
  logout: () => {},
  loading: true,
});

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sessionState = sessionStorage.getItem('isAdminAuthenticated');
    if (sessionState === 'true') {
      setIsAdminAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (user: string, pass: string): boolean => {
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

  const value = {
    isAdminAuthenticated,
    login,
    logout,
    loading,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
