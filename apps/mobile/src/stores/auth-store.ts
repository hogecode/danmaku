/**
 * 認証状態管理（Zustand）
 * ✅ sessionId ベースの認証フロー
 * 
 * persist middleware でセキュアストレージに永続化
 * アプリ再起動時に自動復元される
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { UserInfoDto, UserInfoDtoFromJSON } from '@/generated';
import { appLogger } from '@/utils/logger';

export interface AuthState {
  // 状態
  user: UserInfoDto | null;
  sessionId: string | null; // ✅ sessionId（Express Session ID）
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hydrated: boolean; // ✅ hydration 完了フラグ

  // アクション
  setUser: (user: UserInfoDto | null) => void;
  setSessionId: (sessionId: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
  reset: () => void;
}

// セキュアストレージを使用したカスタムストレージ
const secureStorage: PersistStorage<AuthState> = {
  getItem: async (key: string) => {
    try {
      appLogger.debug(`[SecureStorage] 読み込み開始: ${key}`);
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        const parsed = JSON.parse(value);
        appLogger.debug(`[SecureStorage] 読み込み成功: ${key}`);
        appLogger.debug(`[SecureStorage] 復元されたユーザー: ${JSON.stringify(parsed.state?.user)}`);
        if (parsed.state?.user) {
          appLogger.debug(`[SecureStorage] pictureUrl: ${parsed.state.user.pictureUrl}`);
        }
        return parsed;
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
      appLogger.debug(`[SecureStorage] 保存するユーザー: ${JSON.stringify(value.state?.user)}`);
      
      // ✅ user をマッピングしてから保存
      let stateToSave = value;
      if (value.state?.user) {
        const mappedUser = UserInfoDtoFromJSON(value.state.user);
        appLogger.debug(`[SecureStorage] マッピング後の pictureUrl: ${mappedUser.pictureUrl}`);
        stateToSave = {
          ...value,
          state: {
            ...value.state,
            user: mappedUser,
          },
        };
      }
      
      await SecureStore.setItemAsync(key, JSON.stringify(stateToSave));
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

type PersistedAuthState = Pick<AuthState, 'user' | 'sessionId' | 'isAuthenticated'>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初期状態
      user: null,
      sessionId: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      hydrated: false,

      // アクション
      setUser: (user) => {
        appLogger.debug(`AuthStore: ユーザー情報を設定 - ${user?.name || 'null'}`);
        if (user) {
          appLogger.debug(`AuthStore: pictureUrl = ${user.pictureUrl}`);
        }
        set({ user });
      },

      setSessionId: (sessionId) => {
        appLogger.debug(`AuthStore: sessionId を設定 (length: ${sessionId?.length || 0})`);
        set({ sessionId });
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

      setHydrated: (hydrated) => {
        appLogger.debug(`AuthStore: hydrated = ${hydrated}`);
        set({ hydrated });
      },

      reset: () => {
        appLogger.info('AuthStore: リセット');
        set({
          user: null,
          sessionId: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          hydrated: false,
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
        sessionId: state.sessionId,
        isAuthenticated: state.isAuthenticated,
      }) as PersistedAuthState,
      onRehydrateStorage: () => (state) => {
        if (state && state.user) {
          appLogger.info('[AuthStore] rehydration 開始');
          appLogger.debug('[AuthStore] 復元前:', JSON.stringify(state.user));
          // ✅ setUser を通して、確実にマッピングを実行
          state.setUser(state.user);
          appLogger.debug('[AuthStore] 復元後 pictureUrl:', state.user.pictureUrl);
        }
        state?.setHydrated(true);
      },
    }
  )
);
