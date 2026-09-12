/**
 * ドライブ管理 Hook
 * ✅ Zustand ストアとの連携
 * ✅ ログイン後の drives 初期化
 * ✅ selectedConnectionId の管理
 */

import { useEffect } from 'react';
import { useDrivesStore } from '@/stores/drives-store';
import { useAuth } from './use-auth';
import { appLogger } from '@/utils/logger';

export function useDrives() {
  const auth = useAuth();
  const { drives, selectedConnectionId, setDrives, selectDrive, getSelectedDrive } =
    useDrivesStore();

  // ✅ ログイン後、drives を ストアに初期化
  useEffect(() => {
    if (auth.user?.drives && auth.user.drives.length > 0) {
      appLogger.info(
        `[useDrives] Initializing drives from user info (count: ${auth.user.drives.length})`,
      );
      setDrives(auth.user.drives);
    }
  }, [auth.user?.id]); // user.id が変わったとき（ログイン時）

  const selectedDrive = getSelectedDrive();

  return {
    drives,
    selectedDrive,
    selectedConnectionId,
    selectDrive,
    isLoading: auth.loading,
    error: auth.error,
  };
}
