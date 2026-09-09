/**
 * ビデオプレイヤー カスタムフック
 */

import { useCallback } from 'react';
import { useVideoStore } from '@/stores/video-store';
import { videoService } from '@/services/video-service';
import { appLogger } from '@/utils/logger';
import { VideoPlayerConfig } from '@/types';

export function useVideo() {
  const video = useVideoStore();

  /**
   * プレイヤー設定を初期化
   */
  const initializePlayer = useCallback(async (config: VideoPlayerConfig) => {
    try {
      video.setError(null);
      video.setLoading(true);

      appLogger.info(`[useVideo] プレイヤー初期化中: ${config.fileName}`);

      // ビデオトークンを取得
      const videoToken = await videoService.getVideoToken();

      // ストリーミング URL を構築
      const streamingUrl = videoService.buildStreamingUrl(
        config.videoFileId,
        videoToken
      );

      // 設定を更新
      const updatedConfig = { ...config, videoUrl: streamingUrl };
      video.setConfig(updatedConfig);

      appLogger.info('[useVideo] プレイヤー初期化完了');

      // コメントを読み込む（非同期・エラー無視）
      loadComments(config.videoFileId, config.folderId);

      return updatedConfig;
    } catch (error) {
      appLogger.error('[useVideo] プレイヤー初期化失敗', error);
      video.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      video.setLoading(false);
    }
  }, [video]);

  /**
   * 弾幕を読み込む
   */
  const loadComments = useCallback(async (fileId: string, folderId?: string) => {
    try {
      video.setCommentsLoading(true);
      appLogger.info(`[useVideo] コメント読み込み中: ${fileId}`);

      // DPlayer 互換形式でコメントを取得
      const response = await videoService.getComments(fileId, folderId || 'root');

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
   * 現在の再生位置に基づいて表示するコメントを更新
   */
  const updateVisibleComments = useCallback(
    (currentTime: number, duration: number) => {
      const comments = video.comments;

      // vpos は相対位置（ビデオの先頭からの秒数）で、displayRange を考慮
      // ここでは簡素化して、現在時刻±3秒の範囲を表示
      const displayRange = 3;
      const visibleComments = comments.filter((comment: any) => {
        const commentTime = comment.vpos;
        return Math.abs(currentTime - commentTime) <= displayRange;
      });

      video.setVisibleComments(visibleComments);
    },
    [video]
  );

  /**
   * 再生時間を更新
   */
  const setCurrentTime = useCallback(
    (time: number) => {
      video.setCurrentTime(time);
      // コメント表示を更新
      updateVisibleComments(time, video.duration);
    },
    [video, updateVisibleComments]
  );

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
    updateVisibleComments,
    setCurrentTime,
    cleanup,
  };
}
