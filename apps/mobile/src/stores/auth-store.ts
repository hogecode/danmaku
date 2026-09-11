/**
 * 認証状態管理（Zustand）
 * Flutter の AuthProvider を TypeScript に適応
 * 
 * persist middleware でセキュアストレージに永続化
 * アプリ再起動時に自動復元される
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { UserInfo } from '@/types';
import { appLogger } from '@/utils/logger';

export interface AuthState {
  // 状態
  user: UserInfo | null;
  token: string | null; // JWT アクセストークン
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // アクション
  setUser: (user: UserInfo | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// セキュアストレージを使用したカスタムストレージ
const secureStorage: PersistStorage<AuthState> = {
  getItem: async (key: string) => {
    try {
      appLogger.debug(`[SecureStorage] 読み込み開始: ${key}`);
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        appLogger.debug(`[SecureStorage] 読み込み成功: ${key}`);
        return JSON.parse(value);
      }
      appLogger.debug(`[SecureStorage] 保存データなし: ${key}`);
      return null;
    } catch (error) {
      appLogger.error(`[SecureStorage] 読み込み失敗: ${key}`, error);
      return null;
    }
  },

  setItem: async (key: string, value) => {
    try {
      appLogger.debug(`[SecureStorage] 保存開始: ${key}`);
      await SecureStore.setItemAsync(key, JSON.stringify(value));
      appLogger.debug(`[SecureStorage] 保存成功: ${key}`);
    } catch (error) {
      appLogger.error(`[SecureStorage] 保存失敗: ${key}`, error);
    }
  },

  removeItem: async (key: string) => {
    try {
      appLogger.debug(`[SecureStorage] 削除開始: ${key}`);
      await SecureStore.deleteItemAsync(key);
      appLogger.debug(`[SecureStorage] 削除成功: ${key}`);
    } catch (error) {
      appLogger.error(`[SecureStorage] 削除失敗: ${key}`, error);
    }
  },
};

type PersistedAuthState = Pick<AuthState, 'user' | 'token' | 'isAuthenticated'>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初期状態
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // アクション
      setUser: (user) => {
        appLogger.debug(`AuthStore: ユーザー情報を設定 - ${user?.name || 'null'}`);
        set({ user });
      },

      setToken: (token) => {
        appLogger.debug(`AuthStore: トークンを設定 (length: ${token?.length || 0})`);
        set({ token });
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
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: 'auth-store', // セキュアストレージのキー
      storage: secureStorage as unknown as PersistStorage<PersistedAuthState>,
      // user と isAuthenticated だけを永続化
      // loading と error は永続化しない（実行時のみ）
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }) as PersistedAuthState,
    }
  )
);
