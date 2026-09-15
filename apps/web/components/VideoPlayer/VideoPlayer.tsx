'use client';

import { useEffect, useRef, useState } from 'react';
import type { DPlayerCommentDto } from '@/lib/generated';
import { usePlayerComments } from '@/hooks';

/**
 * 動画ストリーミング URL を生成
 * 
 * @param connectionId - Google Drive接続ID
 * @param videoFileId - ビデオファイルID
 */
function generateVideoStreamUrl(connectionId: string, videoFileId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  return `${baseUrl}/api/player/stream/${connectionId}/${videoFileId}`;
}

interface VideoPlayerProps {
  videoFileId: string;
  folderId?: string;
  connectionId?: string;
  containerClassName?: string;
  commentSettings?: {
    speedRate?: number;
    fontSize?: number;
    closeFormAfterSend?: boolean;
  };
  playerSettings?: {
    theme?: string;
    autoplay?: boolean;
    loop?: boolean;
  };
}

export function VideoPlayer({
  videoFileId,
  folderId,
  connectionId,
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
  const commentListRef = useRef<DPlayerCommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: dplayerComments = [], isLoading: commentsLoading, error: commentsError } = usePlayerComments(
    videoFileId,
    folderId,
    connectionId,
  );

  useEffect(() => {
    let cancelled = false;

    const initializeDPlayer = async () => {
      if (!containerRef.current) {
        setError('Container not available');
        return;
      }

      try {
        setIsLoading(true);

        commentListRef.current = dplayerComments || [];
        console.log(`[VideoPlayer] Loaded ${commentListRef.current.length} comments`);

        const DPlayerModule = (await import('dplayer')).default;

        if (cancelled || !containerRef.current) return;

        if (!connectionId) {
          throw new Error('connectionId is required for video streaming');
        }
        const videoUrl = generateVideoStreamUrl(connectionId, videoFileId);

        const dp = new DPlayerModule({
          container: containerRef.current,
          theme: playerSettings.theme || '#E64F97',
          lang: 'ja-jp',
          loop: playerSettings.loop || false,
          autoplay: playerSettings.autoplay !== false,
          hotkey: true,
          screenshot: false,
          crossOrigin: 'use-credentials',
          volume: 1.0,
          playbackSpeed: [0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2],

          video: {
            url: videoUrl,
            type: 'normal',
          },

          apiBackend: {
            read: (options: any) => {
              const comments = commentListRef.current;
              console.log(`[VideoPlayer] Reading ${comments.length} comments`);
              options.success(comments);
            },
            send: (options: any) => {
              console.log('[VideoPlayer] Comment send:', options);
              options.success();
            },
          },

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

    if (commentsError) {
      console.warn('[VideoPlayer] Comments loading error (non-fatal):', commentsError);
    }

    initializeDPlayer();

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
  }, [videoFileId, folderId, connectionId, dplayerComments, playerSettings, commentSettings]);

  return (
    <div className={containerClassName} style={{ position: 'relative' }}>
      {error && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(220, 38, 38, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: '0.375rem', zIndex: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>エラーが発生しました</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>
          </div>
        </div>
      )}

      {isLoading && !error && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p>動画を準備中...</p>
          </div>
        </div>
      )}

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
