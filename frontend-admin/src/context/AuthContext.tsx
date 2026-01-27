import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface Admin {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'super_admin' | 'admin';
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateAdmin: (data: Partial<Admin>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      const savedAdmin = localStorage.getItem('admin_user');

      if (token && savedAdmin) {
        try {
          // Verify token is still valid
          const response = await authAPI.getMe();
          setAdmin(response.data.data);
        } catch {
          // Token is invalid, clear storage
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    const { token, admin: adminData } = response.data.data;

    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  const updateAdmin = (data: Partial<Admin>) => {
    if (admin) {
      const updatedAdmin = { ...admin, ...data };
      setAdmin(updatedAdmin);
      localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        updateAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
