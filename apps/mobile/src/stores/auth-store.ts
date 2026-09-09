/**
 * 認証状態管理（Zustand）
 * Flutter の AuthProvider を TypeScript に適応
 */

import { create } from 'zustand';
import { UserInfo } from '@/types';
import { appLogger } from '@/utils/logger';

export interface AuthState {
  // 状態
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // アクション
  setUser: (user: UserInfo | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 初期状態
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // アクション
  setUser: (user) => {
    appLogger.debug(`AuthStore: ユーザー情報を設定 - ${user?.name || 'null'}`);
    set({ user });
  },

  setIsAuthenticated: (isAuthenticated) => {
    appLogger.debug(`AuthStore: isAuthenticated = ${isAuthenticated}`);
    set({ isAuthenticated });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    if (error) {
      appLogger.warning(`AuthStore: エラー - ${error}`);
    }
    set({ error });
  },

  reset: () => {
    appLogger.info('AuthStore: リセット');
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },
}));
