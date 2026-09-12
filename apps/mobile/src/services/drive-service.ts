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
   * フォルダ内のファイル一覧を取得
   * GET /api/drive/list
   * @param connectionId - ドライブ接続ID（マルチプロバイダー対応）
   * @param folderId - フォルダID（デフォルト: 'root'）
   * @returns FolderListDto（FileItemDto[] を含む）
   */
  async listFolder(
    connectionId: string,
    folderId: string = 'root'
  ): Promise<FolderListDto> {
    try {
      appLogger.info(
        `DriveService: フォルダ一覧を取得中 (connectionId=${connectionId}, folderId=${folderId})`
      );

      const response = await this.folderApi.folderControllerListFolder({
        connectionId,
        folderId,
      });

      appLogger.info(
        `DriveService: フォルダ一覧取得成功: ${response?.items?.length || 0} 個`
      );

      return response;
    } catch (error) {
      appLogger.error('DriveService: フォルダ一覧取得失敗', error);
      throw new DriveException('Failed to list folder', (error as any)?.status);
    }
  }

  /**
   * 特定の接続からフォルダ内容を取得（マルチプロバイダー対応）
   * GET /api/drive/connections/:connectionId/files
   * @param connectionId - ドライブ接続ID
   * @param folderId - フォルダID（オプション）
   * @returns FolderListDto（FileItemDto[] を含む）
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
   * キーワード検索
   * GET /api/drive/search
   * @param connectionId - ドライブ接続ID
   * @param folderId - 検索対象フォルダID
   * @param query - 検索キーワード
   * @returns FolderListDto（FileItemDto[] を含む）
   */
  async search(
    connectionId: string,
    folderId: string,
    query: string
  ): Promise<FolderListDto> {
    try {
      appLogger.info(
        `DriveService: 検索実行中 (connectionId=${connectionId}, folderId=${folderId}, query=${query})`
      );

      const response = await this.folderApi.folderControllerSearch({
        connectionId,
        folderId,
        query,
      });

      appLogger.info(
        `DriveService: 検索完了: ${response?.items?.length || 0} 件`
      );

      return response;
    } catch (error) {
      appLogger.error('DriveService: 検索失敗', error);
      throw new DriveException('Search failed', (error as any)?.status);
    }
  }

  /**
   * 接続別検索
   * GET /api/drive/connections/:connectionId/search
   * @param connectionId - ドライブ接続ID
   * @param folderId - 検索対象フォルダID
   * @param query - 検索キーワード
   * @returns FolderListDto（FileItemDto[] を含む）
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
