/**
 * Google Drive カスタムフック
 */

import { useCallback } from 'react';
import { useDriveStore } from '@/stores/drive-store';
import { driveService } from '@/services/drive-service';
import { appLogger } from '@/utils/logger';

export function useDrive() {
  const drive = useDriveStore();

  /**
   * フォルダ内のファイル一覧を読み込む
   */
  const loadFolder = useCallback(async (folderId?: string) => {
    try {
      drive.setError(null);
      drive.setLoading(true);

      const currentFolderId = folderId || drive.getCurrentFolderId();
      appLogger.info(`[useDrive] フォルダを読み込み中... (folderId=${currentFolderId})`);

      const files = await driveService.listFolder(currentFolderId);

      drive.setFiles(files);

      appLogger.info(`[useDrive] フォルダ読み込み完了: ${files.length} 個`);
    } catch (error) {
      appLogger.error('[useDrive] フォルダ読み込み失敗', error);
      drive.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      drive.setLoading(false);
    }
  }, [drive]);

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
   */
  const search = useCallback(async (query: string) => {
    try {
      if (!query.trim()) {
        appLogger.warning('[useDrive] 検索キーワードが空です');
        return;
      }

      drive.setError(null);
      drive.setLoading(true);

      const currentFolderId = drive.getCurrentFolderId();
      appLogger.info(`[useDrive] 検索実行中: query=${query}`);

      const files = await driveService.search(currentFolderId, query);

      drive.setFiles(files);

      appLogger.info(`[useDrive] 検索完了: ${files.length} 件`);
    } catch (error) {
      appLogger.error('[useDrive] 検索失敗', error);
      drive.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      drive.setLoading(false);
    }
  }, [drive]);

  return {
    ...drive,
    loadFolder,
    navigateToFolder,
    goBack,
    refresh,
    search,
  };
}
