/**
 * 複数ドライブの認証状態管理（Zustand）
 * Google Drive, OneDrive など複数のクラウドストレージに
 * 同時ログインできるようにセッション情報を管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { DriveSession, DriveType } from '@/types/drive';
import { appLogger } from '@/utils/logger';

export interface DriveAuthState {
  // 状態：各ドライブのセッション情報
  sessions: Record<DriveType, DriveSession>;
  currentDriveType: DriveType | null;

  // アクション
  setSessionAuthenticated: (driveType: DriveType, isAuth: boolean) => void;
  setSessionUser: (
    driveType: DriveType,
    user: DriveSession['user']
  ) => void;
  setSessionError: (driveType: DriveType, error: string | null) => void;
  setCurrentDriveType: (driveType: DriveType | null) => void;
  updateSessionLastSync: (driveType: DriveType) => void;

  // 確認メソッド
  isAuthenticated: (driveType: DriveType) => boolean;
  hasAnyAuthenticated: () => boolean;
  getAllAuthenticatedDrives: () => DriveType[];

  // リセット
  reset: () => void;
  logoutDrive: (driveType: DriveType) => void;
  logoutAll: () => void;
}

// セキュアストレージを使用したカスタムストレージ
const secureStorage: PersistStorage<DriveAuthState> = {
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

type PersistedDriveAuthState = Pick<
  DriveAuthState,
  'sessions' | 'currentDriveType'
>;

export const useDriveAuthStore = create<DriveAuthState>()(
  persist(
    (set, get) => ({
      // 初期状態
      sessions: {
        gdrive: {
          type: 'gdrive',
          isAuthenticated: false,
        },
        onedrive: {
          type: 'onedrive',
          isAuthenticated: false,
        },
      },
      currentDriveType: null,

      // 認証状態を更新
      setSessionAuthenticated: (driveType, isAuth) => {
        appLogger.info(
          `[DriveAuthStore] ${driveType} 認証状態を ${isAuth} に変更`
        );
        set((state) => ({
          sessions: {
            ...state.sessions,
            [driveType]: {
              ...state.sessions[driveType],
              isAuthenticated: isAuth,
              error: isAuth ? null : state.sessions[driveType].error,
            },
          },
        }));
      },

      // ユーザー情報を設定
      setSessionUser: (driveType, user) => {
        appLogger.info(
          `[DriveAuthStore] ${driveType} ユーザー情報を設定 - ${user?.name || 'null'}`
        );
        set((state) => ({
          sessions: {
            ...state.sessions,
            [driveType]: {
              ...state.sessions[driveType],
              user,
            },
          },
        }));
      },

      // エラーを設定
      setSessionError: (driveType, error) => {
        if (error) {
          appLogger.warning(`[DriveAuthStore] ${driveType} エラー - ${error}`);
        }
        set((state) => ({
          sessions: {
            ...state.sessions,
            [driveType]: {
              ...state.sessions[driveType],
              error,
            },
          },
        }));
      },

      // 現在のドライブを設定
      setCurrentDriveType: (driveType) => {
        appLogger.info(
          `[DriveAuthStore] 現在のドライブを ${driveType} に変更`
        );
        set({ currentDriveType: driveType });
      },

      // 最終同期時刻を更新
      updateSessionLastSync: (driveType) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [driveType]: {
              ...state.sessions[driveType],
              lastSync: Date.now(),
            },
          },
        }));
      },

      // 指定されたドライブが認証済みか
      isAuthenticated: (driveType) => {
        return get().sessions[driveType]?.isAuthenticated ?? false;
      },

      // 少なくとも1つのドライブが認証済みか
      hasAnyAuthenticated: () => {
        return Object.values(get().sessions).some(
          (session) => session?.isAuthenticated
        );
      },

      // 認証済みのドライブを全て取得
      getAllAuthenticatedDrives: () => {
        return Object.entries(get().sessions)
          .filter(([, session]) => session?.isAuthenticated)
          .map(([type]) => type as DriveType);
      },

      // 特定のドライブからログアウト
      logoutDrive: (driveType) => {
        appLogger.info(`[DriveAuthStore] ${driveType} からログアウト`);
        set((state) => ({
          sessions: {
            ...state.sessions,
            [driveType]: {
              type: driveType,
              isAuthenticated: false,
              user: undefined,
              error: null,
            },
          },
          currentDriveType:
            state.currentDriveType === driveType ? null : state.currentDriveType,
        }));
      },

      // すべてのドライブからログアウト
      logoutAll: () => {
        appLogger.info('[DriveAuthStore] すべてのドライブからログアウト');
        set({
          sessions: {
            gdrive: {
              type: 'gdrive',
              isAuthenticated: false,
            },
            onedrive: {
              type: 'onedrive',
              isAuthenticated: false,
            },
          },
          currentDriveType: null,
        });
      },

      // リセット
      reset: () => {
        appLogger.info('[DriveAuthStore] リセット');
        set({
          sessions: {
            gdrive: {
              type: 'gdrive',
              isAuthenticated: false,
            },
            onedrive: {
              type: 'onedrive',
              isAuthenticated: false,
            },
          },
          currentDriveType: null,
        });
      },
    }),
    {
      name: 'drive-auth-store',
      storage:
        secureStorage as unknown as PersistStorage<PersistedDriveAuthState>,
      partialize: (state) => ({
        sessions: state.sessions,
        currentDriveType: state.currentDriveType,
      }) as PersistedDriveAuthState,
    }
  )
);
