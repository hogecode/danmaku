/**
 * ビデオサービス
 * OpenAPI 自動生成クライアントを使用
 */

import { API_BASE_URL } from '@/utils/constants';
import { appLogger } from '@/utils/logger';
import { AuthApi, PlayerApi } from '@/generated';
import { createApiConfiguration } from './api-config';

export class VideoException extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(`VideoException: ${message} (status: ${statusCode})`);
  }
}

export class VideoService {
  private authApi: AuthApi;
  private playerApi: PlayerApi;

  constructor() {
    try {
      // OpenAPI Configuration を設定
      const config = createApiConfiguration();
      this.authApi = new AuthApi(config);
      this.playerApi = new PlayerApi(config);
      appLogger.info('VideoService: 初期化完了');
    } catch (error) {
      appLogger.error('VideoService: 初期化失敗', error);
      throw error;
    }
  }

  /**
   * ビデオトークンを生成
   * POST /api/auth/video-token
   * @returns トークン
   */
  async getVideoToken(): Promise<string> {
    try {
      appLogger.info('VideoService: ビデオトークン取得中...');

      // authControllerGenerateVideoToken はvoidを返すため、
      // トークン取得後、代わりにコールバック後のユーザー情報から取得するか
      // または異なるエンドポイントを使用する必要があります
      // 現在のAPIでは video-token エンドポイントは void を返すようです
      await this.authApi.authControllerGenerateVideoToken();

      // 実装に応じてトークンを取得
      // Note: API仕様ではトークンが返されないため、別途実装が必要
      const token = ''; // TODO: API仕様に応じて実装

      appLogger.info(`VideoService: ビデオトークン取得成功`);
      return token;
    } catch (error) {
      appLogger.error('VideoService: ビデオトークン取得失敗', error);
      throw new VideoException('Failed to generate video token', (error as any)?.status);
    }
  }

  /**
   * ストリーミング URL を構築
   * @param fileId Google Drive ファイルID
   * @param videoToken ビデオトークン
   * @returns ストリーミング URL
   */
  buildStreamingUrl(fileId: string, videoToken: string): string {
    const baseUrl = API_BASE_URL;
    const url = `${baseUrl}/api/player/stream/${fileId}?token=${encodeURIComponent(
      videoToken
    )}`;
    appLogger.debug(`VideoService: ストリーミングURL構築: ${url}`);
    return url;
  }

  /**
   * DPlayer 互換形式でコメントを取得
   * GET /api/player/comments/{videoFileId}
   * @param videoFileId Google Drive ビデオファイルID
   * @param folderId フォルダID
   * @returns DPlayer 互換形式のコメント
   */
  async getComments(videoFileId: string, folderId: string = 'root'): Promise<any> {
    try {
      appLogger.info(`VideoService: コメント取得中 (videoFileId=${videoFileId})`);

      const response = await this.playerApi.playerControllerGetComments({
        videoFileId,
        folderId,
      });

      appLogger.info(`VideoService: コメント取得成功`);
      return response;
    } catch (error) {
      appLogger.warning(`VideoService: コメント取得失敗（続行）`, error);
      // コメント取得失敗は致命的ではない
      return { comments: [] };
    }
  }
}

export const videoService = new VideoService();
