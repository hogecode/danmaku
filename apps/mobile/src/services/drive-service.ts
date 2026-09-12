/**
 * フォルダ・ドライブサービス
 * OpenAPI 自動生成クライアントを使用
 * マルチプロバイダー対応（connectionId が必須）
 */

import { appLogger } from '@/utils/logger';
import { FileItemDto, FolderListDto } from '@/generated';
import { FolderApi } from '@/generated';
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
  private folderApi: FolderApi;
  private token?: string;

  constructor(token?: string) {
    try {
      this.token = token;
      // OpenAPI Configuration を設定（ドライブ固有のトークンを渡す）
      const config = createApiConfiguration(token);
      this.folderApi = new FolderApi(config);
      appLogger.info('DriveService: 初期化完了');
    } catch (error) {
      appLogger.error('DriveService: 初期化失敗', error);
      throw error;
    }
  }

  /**
   * 特定の接続からフォルダ内容を取得（マルチプロバイダー対応）
   * GET /api/drive/connections/:connectionId/files
   */
  async listFolderByConnection(
    connectionId: string,
    folderId?: string
  ): Promise<FolderListDto> {
    try {
      appLogger.info(
        `DriveService: 接続別フォルダ一覧を取得中 (connectionId=${connectionId}, folderId=${folderId})`
      );

      const response = await this.folderApi.folderControllerListFolderByConnection(
        {
          connectionId,
          folderId,
        }
      );

      appLogger.info(
        `DriveService: 接続別フォルダ一覧取得成功: ${response?.items?.length || 0} 個`
      );

      return response;
    } catch (error) {
      appLogger.error('DriveService: 接続別フォルダ一覧取得失敗', error);
      throw new DriveException(
        'Failed to list folder by connection',
        (error as any)?.status
      );
    }
  }

  /**
   * 接続別検索
   * GET /api/drive/connections/:connectionId/search
   */
  async searchByConnection(
    connectionId: string,
    folderId: string,
    query: string
  ): Promise<FolderListDto> {
    try {
      appLogger.info(
        `DriveService: 接続別検索実行中 (connectionId=${connectionId}, folderId=${folderId}, query=${query})`
      );

      const response = await this.folderApi.folderControllerSearchByConnection({
        connectionId,
        folderId,
        query,
      });

      appLogger.info(
        `DriveService: 接続別検索完了: ${response?.items?.length || 0} 件`
      );

      return response;
    } catch (error) {
      appLogger.error('DriveService: 接続別検索失敗', error);
      throw new DriveException(
        'Search by connection failed',
        (error as any)?.status
      );
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
