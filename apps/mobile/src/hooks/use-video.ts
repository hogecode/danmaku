/**
 * ビデオプレイヤー カスタムフック
 */

import { useCallback } from 'react';
import { useVideoStore } from '@/stores/video-store';
import { useDrivesStore } from '@/stores/drives-store';
import { videoService } from '@/services/video-service';
import { appLogger } from '@/utils/logger';
import { VideoPlayerConfig } from '@/types';

export function useVideo() {
  const video = useVideoStore();
  const { selectedConnectionId } = useDrivesStore();

  /**
   * プレイヤー設定を初期化
   */
  const initializePlayer = useCallback(async (config: VideoPlayerConfig) => {
    try {
      video.setError(null);
      video.setLoading(true);

      appLogger.info(`[useVideo] プレイヤー初期化中: ${config.fileName}, isLocalFile: ${config.isLocalFile}`);

      let streamingUrl: string;

      // ローカルファイルの場合は URI をそのまま使用
      if (config.isLocalFile) {
        streamingUrl = config.videoFileId;
        appLogger.info(`[useVideo] ローカルファイルURL: ${streamingUrl}`);
      } else {
        // ✅ selectedConnectionId を取得
        if (!selectedConnectionId) {
          throw new Error('ドライブが選択されていません');
        }

        // ビデオトークンを取得
        const videoToken = await videoService.getVideoToken();

        // ✅ ストリーミング URL を構築（connectionId, fileId, token を渡す）
        streamingUrl = videoService.buildStreamingUrl(
          selectedConnectionId,
          config.videoFileId,
          videoToken ? `token=${videoToken}` : ''
        );
      }

      // 設定を更新
      const updatedConfig = { ...config, videoUrl: streamingUrl };
      video.setConfig(updatedConfig);

      appLogger.info('[useVideo] プレイヤー初期化完了');

      // コメントを読み込む（非同期・エラー無視）
      if (!config.isLocalFile && selectedConnectionId) {
        loadComments(config.videoFileId, selectedConnectionId, config.folderId);
      }

      return updatedConfig;
    } catch (error) {
      appLogger.error('[useVideo] プレイヤー初期化失敗', error);
      video.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      video.setLoading(false);
    }
  }, [video, selectedConnectionId]);

  /**
   * 弾幕を読み込む
   */
  const loadComments = useCallback(async (fileId: string, connectionId: string, folderId?: string) => {
    try {
      video.setCommentsLoading(true);
      appLogger.info(`[useVideo] コメント読み込み中: ${fileId}`);

      // ✅ connectionId を渡してコメントを取得
      const response = await videoService.getComments(fileId, connectionId, folderId || 'root');

      // comments は DPlayer 形式：{ time, type, size, color, author, text }
      const comments = response.comments || [];


      // DPlayer 形式から内部形式に変換
      // NOTE: comment.time は秒単位（浮動小数点数）
      // これを vpos として保持（Player.tsx で time に戻す）
      const convertedComments = comments.map((comment: any) => ({
        thread: '',
        no: 0,
        vpos: parseFloat(comment.time) || 0, // 秒単位のまま保持（小数点を保つ）
        date: Math.floor(Date.now() / 1000),
        user_id: comment.author || '',
        text: comment.text || '',
      }));

      video.setComments(convertedComments);

    } catch (error) {
      appLogger.warning('[useVideo] コメント読み込み失敗（続行）', error);
      // コメント読み込み失敗は致命的ではない
    } finally {
      video.setCommentsLoading(false);
    }
  }, [video]);


  /**
   * クリーンアップ
   */
  const cleanup = useCallback(() => {
    appLogger.info('[useVideo] クリーンアップ');
    video.reset();
  }, [video]);

  return {
    ...video,
    initializePlayer,
    loadComments,
    cleanup,
  };
}
