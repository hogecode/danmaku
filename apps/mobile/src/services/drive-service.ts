/**
 * Google Drive サービス
 * OpenAPI 自動生成クライアントを使用
 */

import { appLogger } from '@/utils/logger';
import { FileItemDto } from '@/types';
import { GDriveApi } from '@/generated';
import { createApiConfiguration } from './api-config';

export class DriveException extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(`DriveException: ${message} (status: ${statusCode})`);
  }
}

export class DriveService {
  private gdriveApi: GDriveApi;
  private token?: string;

  constructor(token?: string) {
    try {
      this.token = token;
      // OpenAPI Configuration を設定（ドライブ固有のトークンを渡す）
      const config = createApiConfiguration(token);
      this.gdriveApi = new GDriveApi(config);
      appLogger.info('DriveService: 初期化完了');
    } catch (error) {
      appLogger.error('DriveService: 初期化失敗', error);
      throw error;
    }
  }

  /**
   * Google Drive フォルダ内のファイル一覧を取得
   * GET /api/gdrive/list
   * @param folderId フォルダID（デフォルト: 'root'）
   * @returns FileItemDto のリスト
   */
  async listFolder(folderId: string = 'root'): Promise<FileItemDto[]> {
    try {
      appLogger.info(`DriveService: フォルダ一覧を取得中 (folderId=${folderId})`);

      const response = await this.gdriveApi.gDriveControllerListFolder({
        folderId,
      });

      const items = response?.items || [];
      appLogger.info(`DriveService: フォルダ一覧取得成功: ${items.length} 個`);

      return items;
    } catch (error) {
      appLogger.error('DriveService: フォルダ一覧取得失敗', error);
      throw new DriveException('Failed to list folder', (error as any)?.status);
    }
  }

  /**
   * Google Drive でキーワード検索
   * GET /api/gdrive/search
   * @param folderId 検索対象フォルダID
   * @param query 検索キーワード
   * @returns FileItemDto のリスト
   */
  async search(folderId: string, query: string): Promise<FileItemDto[]> {
    try {
      appLogger.info(
        `DriveService: 検索実行中 (folderId=${folderId}, query=${query})`
      );

      const response = await this.gdriveApi.gDriveControllerSearch({
        folderId,
        query,
      });

      const items = response?.items || [];
      appLogger.info(`DriveService: 検索完了: ${items.length} 件`);

      return items;
    } catch (error) {
      appLogger.error('DriveService: 検索失敗', error);
      throw new DriveException('Search failed', (error as any)?.status);
    }
  }
}

/**
 * DriveService ファクトリ
 * 複数ドライブ対応のため、トークンごとに新しいインスタンスを生成
 */
export const createDriveService = (token?: string): DriveService => {
  return new DriveService(token);
};

// デフォルト（auth-store のトークン使用）
export const driveService = new DriveService();
