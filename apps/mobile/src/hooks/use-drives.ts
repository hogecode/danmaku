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
  const { drives, selectedConnectionId, setDrives, selectDrive, getSelectedDrive, hydrated } =
    useDrivesStore();

  // ✅ hydration 完了後、API からドライブを初期化
  // ❌ AsyncStorage に保存済みのドライブを上書きしない
  useEffect(() => {
    // hydration が完了しておらず、かつ drives が空の場合のみ初期化
    if (!hydrated) {
      appLogger.info("[useDrives] Waiting for hydration...");
      return;
    }

    // hydration 完了後、drives が空で、user.drives がある場合のみ初期化
    if (drives.length === 0 && auth.user?.drives && auth.user.drives.length > 0) {
      appLogger.info(
        `[useDrives] Initializing drives from user info after hydration (count: ${auth.user.drives.length})`,
      );
      setDrives(auth.user.drives);
    }
  }, [hydrated, auth.user?.id]); // hydrated または user.id が変わったとき

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
