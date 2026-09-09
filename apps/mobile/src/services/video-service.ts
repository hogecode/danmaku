/**
 * ビデオサービス
 * OpenAPI 自動生成クライアントを使用
 */

import { API_BASE_URL } from '@/utils/constants';
import { appLogger } from '@/utils/logger';
import { AuthApi, PlayerApi } from '@/generated';
import { createApiConfiguration } from './api-config';
import { tokenStorage } from '@/utils/token-storage';

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

      // OpenAPI クライアントの型定義が不完全なため、
      // 直接 fetch を使用してトークンを取得
      const config = createApiConfiguration();
      const response = await fetch(`${config.basePath}/api/auth/video-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new VideoException(`Failed to get video token: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      const token = data.token as string;

      if (!token) {
        throw new VideoException('No token in response');
      }

      appLogger.info(`VideoService: ビデオトークン取得成功 (token length: ${token.length})`);
      return token;
    } catch (error) {
      appLogger.error('VideoService: ビデオトークン取得失敗', error);
      throw new VideoException('Failed to generate video token', (error as any)?.status);
    }
  }

  /**
   * アクセストークンを取得
   * @private
   */
  private async getAccessToken(): Promise<string> {
    const token = await tokenStorage.getToken();
    if (!token) {
      throw new VideoException('No access token available');
    }
    return token;
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
