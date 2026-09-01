'use client';

import { useEffect, useRef, useState } from 'react';
import type { CommentDto } from '@/lib/generated/models';
import { fetchVideoComments, generateVideoStreamUrl } from '@/lib/api/player-client';

interface VideoPlayerProps {
  /**
   * 動画ファイルの GDrive ID
   */
  videoFileId: string;

  /**
   * 動画ファイルが存在するフォルダID
   */
  folderId?: string;

  /**
   * プレイヤーを表示する DOM コンテナ
   */
  containerClassName?: string;

  /**
   * コメント表示設定
   */
  commentSettings?: {
    speedRate?: number;
    fontSize?: number;
    closeFormAfterSend?: boolean;
  };

  /**
   * プレイヤー設定
   */
  playerSettings?: {
    theme?: string;
    autoplay?: boolean;
    loop?: boolean;
  };
}

/**
 * ビデオプレイヤーコンポーネント
 * 
 * DPlayer を使用した動画再生＋コメント表示
 * - GDrive からのビデオストリーミング対応
 * - Range リクエスト対応（シーク機能）
 * - XML/JSON コメントの自動読み込み
 * - コメント速度・フォントサイズ調整対応
 */
export function VideoPlayer({
  videoFileId,
  folderId,
  containerClassName = 'w-full aspect-video bg-black',
  commentSettings = {
    speedRate: 1,
    fontSize: 25,
    closeFormAfterSend: false,
  },
  playerSettings = {
    theme: '#E64F97',
    autoplay: true,
    loop: false,
  },
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dplayerRef = useRef<any>(null);
  const commentListRef = useRef<CommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * DPlayer の初期化
   */
  useEffect(() => {
    let cancelled = false;

    const initializeDPlayer = async () => {
      if (!containerRef.current) {
        setError('Container not available');
        return;
      }

      try {
        setIsLoading(true);

        // コメントを取得（✅ folderId を渡す）
        const commentData = await fetchVideoComments(videoFileId, folderId);
        commentListRef.current = commentData.comments || [];
        console.log(`[VideoPlayer] Loaded ${commentListRef.current.length} comments`);

        // DPlayer の動的インポート
        const DPlayerModule = (await import('dplayer')).default;

        if (cancelled || !containerRef.current) return;

        // 動画ストリーミング URL
        const videoUrl = generateVideoStreamUrl(videoFileId);

        // DPlayer インスタンス作成
        const dp = new DPlayerModule({
          container: containerRef.current,
          theme: playerSettings.theme || '#E64F97',
          lang: 'ja-jp',
          loop: playerSettings.loop || false,
          autoplay: playerSettings.autoplay !== false,
          hotkey: true,
          screenshot: false,
          crossOrigin: 'use-credentials', // クッキーを自動送信
          volume: 1.0,
          playbackSpeed: [0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2],

          // 動画設定
          video: {
            url: videoUrl,
            type: 'normal',
          },

          // コメント（弾幕）バックエンド
          apiBackend: {
            read: (options: any) => {
              const comments = commentListRef.current || [];
              console.log(`[VideoPlayer] DPlayer reading ${comments.length} comments`);
              options.success(comments);
            },
            send: (options: any) => {
              console.log('[VideoPlayer] Comment send:', options);
              options.success();
            },
          },

          // 弾幕（コメント）設定
          danmaku: {
            id: 'danmaku-local',
            user: 'ユーザー',
            speedRate: commentSettings.speedRate || 1,
            fontSize: commentSettings.fontSize || 25,
            closeCommentFormAfterSend: commentSettings.closeFormAfterSend || false,
          },
        });

        if (cancelled) {
          dp.destroy?.();
          return;
        }

        dplayerRef.current = dp;
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize DPlayer';
        console.error('[VideoPlayer] Initialization error:', message);
        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeDPlayer();

    // クリーンアップ
    return () => {
      cancelled = true;
      if (dplayerRef.current) {
        try {
          dplayerRef.current.destroy?.();
        } catch (e) {
          console.warn('[VideoPlayer] Error destroying DPlayer:', e);
        }
        dplayerRef.current = null;
      }
    };
  }, [videoFileId, folderId, playerSettings, commentSettings]);

  return (
    <div className={containerClassName} style={{ position: 'relative' }}>
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(220, 38, 38, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            borderRadius: '0.375rem',
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>エラーが発生しました</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
          </div>
        </div>
      )}

      {isLoading && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p>動画を準備中...</p>
          </div>
        </div>
      )}

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
