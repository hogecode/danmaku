/**
 * ビデオ・プレイヤーサービス
 * OpenAPI 自動生成クライアントを使用
 */

import { API_BASE_URL } from '@/utils/constants';
import { appLogger } from '@/utils/logger';
import { PlayerApi, DPlayerCommentListDto } from '@/generated';
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
  private playerApi: PlayerApi;

  constructor() {
    try {
      // OpenAPI Configuration を設定
      const config = createApiConfiguration();
      this.playerApi = new PlayerApi(config);
      appLogger.info('VideoService: 初期化完了');
    } catch (error) {
      appLogger.error('VideoService: 初期化失敗', error);
      throw error;
    }
  }

  /**
   * ビデオストリーミング用トークンを生成
   * POST /api/player/token
   * 目的: モバイルアプリでの動画URL認証
   * - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成
   * - 有効期限: 15分（デフォルト）
   * @returns トークン（JWT文字列）
   */
  async getVideoToken(): Promise<string> {
    try {
      appLogger.info('VideoService: ビデオトークン生成中...');

      // ✅ fetch で直接 API を叩く（OpenAPI クライアントの型定義問題を回避）
      const response = await fetch(`${API_BASE_URL}/api/player/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // セッションCookieを含める
      });

      if (!response.ok) {
        throw new Error(`Failed to generate token: ${response.statusText}`);
      }

      const data = await response.json();
      const token = data.token || '';

      appLogger.info('VideoService: ビデオトークン生成成功');
      return token;
    } catch (error) {
      appLogger.error('VideoService: ビデオトークン生成失敗', error);
      throw new VideoException('Failed to generate video token', (error as any)?.status);
    }
  }

  /**
   * ストリーミング URL を構築
   * @param connectionId - ドライブ接続ID
   * @param fileId - Google Drive ファイルID
   * @param range - HTTP Range ヘッダー値
   * @returns ストリーミング URL
   */
  buildStreamingUrl(
    connectionId: string,
    fileId: string,
    range: string = ''
  ): string {
    const baseUrl = API_BASE_URL;
    const url = `${baseUrl}/api/player/stream/${connectionId}/${fileId}${
      range ? `?range=${encodeURIComponent(range)}` : ''
    }`;
    appLogger.debug(`VideoService: ストリーミングURL構築: ${url}`);
    return url;
  }

  /**
   * DPlayer 互換形式でコメントを取得
   * GET /api/player/comments/{videoFileId}
   * コメントファイルの自動検出:
   * - 動画: "aaa.mp4"
   * - コメント: "aaa.xml" または "aaa.json" を自動検索
   * - 見つかった場合: DPlayer 互換形式に変換して返す
   * - 見つからない場合: 空配列を返す
   */
  async getComments(
    videoFileId: string,
    connectionId: string,
    folderId: string = 'root'
  ): Promise<DPlayerCommentListDto> {
    try {
      appLogger.info(
        `VideoService: コメント取得中 (videoFileId=${videoFileId}, connectionId=${connectionId})`
      );

      const response = await this.playerApi.playerControllerGetComments({
        videoFileId,
        connectionId,
        folderId,
      });

      appLogger.info(
        `VideoService: コメント取得成功 (${response?.comments?.length || 0} 件)`
      );
      return response;
    } catch (error) {
      appLogger.warning(`VideoService: コメント取得失敗（続行）`, error);
      // コメント取得失敗は致命的ではない
      // 空配列で初期化したオブジェクトを返す
      return { comments: [] };
    }
  }

  /**
   * ビデオをストリーミング
   * GET /api/player/stream/:connectionId/:fileId
   * Range ヘッダーでバイト範囲を指定可能（HTTP 206 Partial Content 対応）
   * @param connectionId - ドライブ接続ID
   * @param fileId - ファイルID
   * @param range - HTTP Range ヘッダー値（例: "bytes=0-1023"）
   * @returns ストリーミングレスポンス
   */
  async streamVideo(
    connectionId: string,
    fileId: string,
    range: string
  ): Promise<Response> {
    try {
      appLogger.info(
        `VideoService: ストリーミング開始 (connectionId=${connectionId}, fileId=${fileId})`
      );

      const response = await this.playerApi.playerControllerStreamVideoRaw({
        connectionId,
        fileId,
        range,
      });

      appLogger.info('VideoService: ストリーミング成功');
      return response.raw;
    } catch (error) {
      appLogger.error('VideoService: ストリーミング失敗', error);
      throw new VideoException('Failed to stream video', (error as any)?.status);
    }
  }
}

export const videoService = new VideoService();
