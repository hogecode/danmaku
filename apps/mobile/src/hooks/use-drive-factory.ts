/**
 * ドライブ Hook Factory
 * 選択されたドライブタイプに応じて、
 * 対応する Hook インスタンスを返す
 */

import type { DriveType } from '@/types/drive';
import { useDrive } from './use-drive';
import { appLogger } from '@/utils/logger';

/**
 * ドライブタイプに応じた Hook を返す
 * @param driveType - ドライブタイプ ('gdrive' | 'onedrive')
 * @returns 対応するドライブ Hook
 */
export function useDriveFactory(driveType: DriveType) {
  appLogger.info(`[useDriveFactory] ${driveType} の Hook を取得`);

  switch (driveType) {
    case 'gdrive':
      // 既存の Google Drive Hook
      return useDrive();

    case 'onedrive':
      // OneDrive Hook（将来実装）
      // return useOneDrive();
      appLogger.warning('[useDriveFactory] OneDrive はまだ実装されていません');
      throw new Error('OneDrive is not yet implemented');

    default:
      const exhaustive: never = driveType;
      appLogger.error(
        `[useDriveFactory] 不明なドライブタイプ: ${exhaustive}`
      );
      throw new Error(`Unknown drive type: ${driveType}`);
  }
}
