import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(adminApi.getEmail());

  useEffect(() => {
    const verifySession = async () => {
      const token = adminApi.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const result = await adminApi.verify();
      if (result.success && result.email) {
        setIsAuthenticated(true);
        setAdminEmail(result.email);
        adminApi.setEmail(result.email);
      } else {
        adminApi.clearToken();
        setIsAuthenticated(false);
        setAdminEmail(null);
      }
      setIsLoading(false);
    };
    verifySession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminApi.login(email, password);
    if (result.success && result.token && result.email) {
      adminApi.setToken(result.token);
      adminApi.setEmail(result.email);
      setIsAuthenticated(true);
      setAdminEmail(result.email);
    }
    return { success: result.success, message: result.message };
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout();
    adminApi.clearToken();
    setIsAuthenticated(false);
    setAdminEmail(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, adminEmail, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
