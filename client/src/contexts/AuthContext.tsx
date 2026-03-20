import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AccountMeInfo } from '../types/application';
import { getAccountMeInfo } from '../api/applications';

interface AuthContextType {
  accountInfo: AccountMeInfo | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ accountInfo: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: accountInfo = null, isLoading } = useQuery({
    queryKey: ['accountMe'],
    queryFn: getAccountMeInfo,
  });

  return (
    <AuthContext.Provider value={{ accountInfo, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
