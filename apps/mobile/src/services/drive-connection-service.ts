/**
 * ドライブ接続サービス
 * OpenAPI 自動生成クライアントを使用して、Google Drive や OneDrive などのドライブを接続
 */

import { appLogger } from '@/utils/logger';
import { DriveConnectionApi, DriveConnectionInitiateResponseDto } from '@/generated';
import { createApiConfiguration } from './api-config';

export class DriveConnectionException extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(`DriveConnectionException: ${message} (status: ${statusCode})`);
  }
}

export class DriveConnectionService {
  private driveConnectionApi: DriveConnectionApi;

  constructor() {
    try {
      // OpenAPI Configuration を設定
      const config = createApiConfiguration();
      this.driveConnectionApi = new DriveConnectionApi(config);
      appLogger.info('DriveConnectionService: 初期化完了');
    } catch (error) {
      appLogger.error('DriveConnectionService: 初期化失敗', error);
      throw error;
    }
  }

  /**
   * ドライブ接続開始（OAuth認可URLを取得）
   * POST /api/drive-connections/:provider
   * @param provider - プロバイダー名 ('google', 'onedrive', etc.)
   * @returns DriveConnectionInitiateResponseDto (authorizeUrl, state, expiresIn)
   */
  async initiateDriveConnection(
    provider: string
  ): Promise<DriveConnectionInitiateResponseDto> {
    try {
      appLogger.info(
        `[DriveConnectionService] ドライブ接続開始 (provider=${provider})`
      );

      // ✅ OpenAPI 生成コードを直接呼び出し
      // POST /api/drive-connections/:provider
      const response = await this.driveConnectionApi.driveConnectionControllerInitiateConnection(
        { provider },
      );

      appLogger.info(
        '[DriveConnectionService] OAuth URL取得成功'
      );

      return response;
    } catch (error) {
      // エラーの詳細をログに出力
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as any)?.status || (error as any)?.response?.status;
      appLogger.error('[DriveConnectionService] ドライブ接続失敗', {
        message: errorMsg,
        status: errorStatus,
      });
      throw new DriveConnectionException(
        `Drive connection failed: ${errorMsg}`,
        errorStatus
      );
    }
  }
}

export const driveConnectionService = new DriveConnectionService();
