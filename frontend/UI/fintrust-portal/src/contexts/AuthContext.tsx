/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, LoginResponse } from '@/lib/api/auth';

interface AuthContextType {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (custId: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: LoginResponse | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('fintrust_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('fintrust_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (custId: string, password: string) => {
    try {
      const response = await apiLogin({ custId, password });
      setUser(response);
      localStorage.setItem('fintrust_user', JSON.stringify(response));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fintrust_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

