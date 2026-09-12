/**
 * ドライブ管理カスタムフック
 * ✅ マルチプロバイダー対応
 * ✅ connectionId を drives-store から取得
 * ✅ API 呼び出しに connectionId を付与
 */

import { useCallback, useMemo } from 'react';
import { useDriveStore } from '@/stores/drive-store';
import { useDrivesStore } from '@/stores/drives-store';
import { driveService } from '@/services/drive-service';
import { appLogger } from '@/utils/logger';

export function useDrive() {
  const drive = useDriveStore();
  
  // ✅ drives-store から connectionId を取得
  const { selectedConnectionId } = useDrivesStore();

  // ✅ connectionId が必須であることを確認
  const validateConnectionId = useCallback(() => {
    if (!selectedConnectionId) {
      const error = new Error('No drive selected. Please select a drive from the network screen.');
      appLogger.error('[useDrive] connectionId が見つかりません', error);
      throw error;
    }
    return selectedConnectionId;
  }, [selectedConnectionId]);

  /**
   * フォルダ内のファイル一覧を読み込む
   * ✅ connectionId を付与
   */
  const loadFolder = useCallback(async (folderId?: string) => {
    try {
      drive.setError(null);
      drive.setLoading(true);

      // ✅ connectionId を検証
      const connectionId = validateConnectionId();
      const currentFolderId = folderId || drive.getCurrentFolderId();
      
      appLogger.info(`[useDrive] フォルダを読み込み中... (connectionId=${connectionId}, folderId=${currentFolderId})`);

      // ✅ connectionId を付与して API 呼び出し
      const result = await driveService.listFolderByConnection(connectionId, currentFolderId);
      drive.setFiles(result.items);

      appLogger.info(`[useDrive] フォルダ読み込み完了: ${result.items?.length || 0} 個`);
    } catch (error) {
      appLogger.error('[useDrive] フォルダ読み込み失敗', error);
      drive.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      drive.setLoading(false);
    }
  }, [drive, validateConnectionId]);

  /**
   * フォルダに移動
   */
  const navigateToFolder = useCallback(async (folderId: string) => {
    try {
      appLogger.info(`[useDrive] フォルダに移動: ${folderId}`);

      drive.pushFolder(folderId);

      // 新しいフォルダのファイルを読み込む
      await loadFolder(folderId);
    } catch (error) {
      appLogger.error('[useDrive] フォルダ移動失敗', error);
      // 失敗時はスタックをロールバック
      drive.popFolder();
      throw error;
    }
  }, [drive, loadFolder]);

  /**
   * 親フォルダに戻る
   */
  const goBack = useCallback(async () => {
    try {
      const previousFolder = drive.popFolder();

      if (previousFolder) {
        appLogger.info(`[useDrive] 親フォルダに戻る: ${previousFolder}`);
        await loadFolder(previousFolder);
      }
    } catch (error) {
      appLogger.error('[useDrive] 親フォルダ移動失敗', error);
      throw error;
    }
  }, [drive, loadFolder]);

  /**
   * ファイル一覧を更新
   */
  const refresh = useCallback(async () => {
    try {
      appLogger.info('[useDrive] ファイル一覧を更新中...');
      const currentFolderId = drive.getCurrentFolderId();
      await loadFolder(currentFolderId);
    } catch (error) {
      appLogger.error('[useDrive] ファイル一覧更新失敗', error);
      throw error;
    }
  }, [drive, loadFolder]);

  /**
   * 検索を実行
   * ✅ connectionId を付与
   */
  const search = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        appLogger.warning('[useDrive] 検索キーワードが空です');
        return;
      }

      drive.setError(null);
      drive.setLoading(true);

      // ✅ connectionId を検証
      const connectionId = validateConnectionId();
      const currentFolderId = drive.getCurrentFolderId();
      appLogger.info(`[useDrive] 検索実行中: connectionId=${connectionId}, query=${query}`);

      // ✅ connectionId を付与して API 呼び出し
      const result = await driveService.searchByConnection(connectionId, currentFolderId, query);
      drive.setFiles(result.items);

      appLogger.info(`[useDrive] 検索完了: ${result.items?.length || 0} 件`);
    } catch (error) {
      appLogger.error('[useDrive] 検索失敗', error);
      drive.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      drive.setLoading(false);
    }
  }, [drive, validateConnectionId]);

  return {
    ...drive,
    
    // ✅ drives-store から取得
    selectedConnectionId,
    // API 関数
    loadFolder,
    navigateToFolder,
    goBack,
    refresh,
    search,
  };
}
