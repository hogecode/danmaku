/**
 * Google Drive ファイル一覧状態管理（Zustand）
 */

import { create } from 'zustand';
import { FileItemDto } from '@/types';
import { appLogger } from '@/utils/logger';

export interface DriveState {
  // 状態
  files: FileItemDto[];
  loading: boolean;
  error: string | null;
  folderStack: string[]; // フォルダ履歴スタック

  // アクション
  setFiles: (files: FileItemDto[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  pushFolder: (folderId: string) => void;
  popFolder: () => string | null;
  getCurrentFolderId: () => string;
  reset: () => void;
}

export const useDriveStore = create<DriveState>((set, get) => ({
  // 初期状態
  files: [],
  loading: false,
  error: null,
  folderStack: ['root'],

  // アクション
  setFiles: (files) => {
    appLogger.debug(`DriveStore: ${files.length} 個のファイルをセット`);
    set({ files });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    if (error) {
      appLogger.warning(`DriveStore: エラー - ${error}`);
    }
    set({ error });
  },

  pushFolder: (folderId) => {
    const current = get().folderStack;
    appLogger.info(`DriveStore: フォルダに移動 - ${folderId}`);
    set({ folderStack: [...current, folderId] });
  },

  popFolder: () => {
    const current = get().folderStack;
    if (current.length <= 1) {
      appLogger.warning('DriveStore: フォルダスタックが空です');
      return null;
    }
    const folderStack = current.slice(0, -1);
    appLogger.info(`DriveStore: 親フォルダに戻る`);
    set({ folderStack });
    return folderStack[folderStack.length - 1];
  },

  getCurrentFolderId: () => {
    const state = get();
    return state.folderStack[state.folderStack.length - 1] || 'root';
  },

  reset: () => {
    appLogger.info('DriveStore: リセット');
    set({
      files: [],
      loading: false,
      error: null,
      folderStack: ['root'],
    });
  },
}));
