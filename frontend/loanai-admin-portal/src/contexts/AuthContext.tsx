import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminUser {
  bankerId: string;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  login: (bankerId: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Valid 9-digit banker IDs
const validBankerIds: Record<string, AdminUser> = {
  "123456789": { bankerId: "123456789", name: "Rajesh Banker", role: "Senior Loan Officer" },
  "987654321": { bankerId: "987654321", name: "Meera Kapoor", role: "Branch Manager" },
  "111222333": { bankerId: "111222333", name: "Arun Nair", role: "Credit Analyst" },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = sessionStorage.getItem('loanai_admin');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (bankerId: string): boolean => {
    if (bankerId.length === 9 && /^\d+$/.test(bankerId)) {
      const user = validBankerIds[bankerId] || {
        bankerId,
        name: `Banker ${bankerId.slice(-4)}`,
        role: "Loan Officer"
      };
      setAdmin(user);
      sessionStorage.setItem('loanai_admin', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem('loanai_admin');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
