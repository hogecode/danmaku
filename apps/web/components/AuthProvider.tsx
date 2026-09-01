'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useAuth, UserInfo } from '@/hooks/useAuth';

/**
 * 認証コンテキスト型
 */
interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  startLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
}

/**
 * 認証コンテキスト
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証プロバイダーコンポーネント
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        isAuthenticated: auth.isAuthenticated,
        startLogin: auth.startLogin,
        logout: auth.logout,
        refreshToken: auth.refreshToken,
        fetchUserInfo: async () => {
          await auth.fetchUserInfo();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 認証コンテキストを使用するカスタムフック
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
