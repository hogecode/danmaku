"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import type { DPlayerCommentDto } from "@/lib/generated";
import { usePlayerComments } from "@/hooks";

/**
 * 動画ストリーミング URL を生成
 *
 * @param connectionId - Google Drive接続ID
 * @param videoFileId - ビデオファイルID
 */
function generateVideoStreamUrl(
  connectionId: string,
  videoFileId: string,
): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  return `${baseUrl}/api/player/stream/${connectionId}/${videoFileId}`;
}

interface VideoPlayerProps {
  videoFileId: string;
  folderId?: string;
  connectionId?: string;
  containerClassName?: string;
  initialComments?: DPlayerCommentDto[];
  commentSettings?: {
    speedRate?: number;
    fontSize?: number;
    opacity?: number;
    maxCount?: number;
    displayDuration?: number;
    closeFormAfterSend?: boolean;
  };
  playerSettings?: {
    theme?: string;
    autoplay?: boolean;
    loop?: boolean;
    playbackSpeed?: number;
  };
}

/**
 * DPlayer への操作インターフェース
 */
export interface VideoPlayerHandle {
  /**
   * コメントを動的に追加/置き換え
   * @param comments 追加するコメント配列
   * @param mergeMode true=既存コメントに追加, false=置き換え
   */
  addComments(comments: DPlayerCommentDto[], mergeMode?: boolean): void;

  /**
   * 現在のコメントをクリア
   */
  clearComments(): void;

  /**
   * DPlayer インスタンスを取得
   */
  getDPlayer(): any;
}

function VideoPlayerComponent(
  {
    videoFileId,
    folderId,
    connectionId,
    containerClassName = "w-full aspect-video bg-black",
    initialComments = [],
    commentSettings = {
      speedRate: 1,
      fontSize: 25,
      opacity: 0.7,
      maxCount: 100,
      displayDuration: 5,
      closeFormAfterSend: false,
    },
    playerSettings = {
      theme: "#E64F97",
      autoplay: true,
      loop: false,
      playbackSpeed: 1,
    },
  }: VideoPlayerProps,
  ref: React.Ref<VideoPlayerHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dplayerRef = useRef<any>(null);
  const commentListRef = useRef<DPlayerCommentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: dplayerComments = [],
    isLoading: commentsLoading,
    error: commentsError,
  } = usePlayerComments(videoFileId, folderId, connectionId);

  useEffect(() => {
    let cancelled = false;

    const initializeDPlayer = async () => {
      if (!containerRef.current) {
        setError("Container not available");
        return;
      }

      try {
        setIsLoading(true);

        // 初期コメント + ニコ動コメント（initialComments）を合併
        commentListRef.current = [
          ...(dplayerComments || []),
          ...(initialComments || []),
        ];
        console.log(
          `[VideoPlayer] Loaded ${commentListRef.current.length} comments (${dplayerComments?.length || 0} initial + ${initialComments?.length || 0} additional)`,
        );

        const DPlayerModule = (await import("dplayer")).default;

        if (cancelled || !containerRef.current) return;

        if (!connectionId) {
          throw new Error("connectionId is required for video streaming");
        }
        const videoUrl = generateVideoStreamUrl(connectionId, videoFileId);

        // ✅ 再生速度リストを生成（ユーザー設定値をデフォルトに設定）
        const defaultPlaybackSpeed = playerSettings.playbackSpeed || 1;
        const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2];

        const dp = new DPlayerModule({
          container: containerRef.current,
          theme: playerSettings.theme || "#E64F97",
          lang: "ja-jp",
          loop: playerSettings.loop || false,
          autoplay: playerSettings.autoplay !== false,
          hotkey: true,
          screenshot: false,
          crossOrigin: "use-credentials",
          volume: 1.0,
          playbackSpeed: playbackSpeeds,

          video: {
            url: videoUrl,
            type: "normal",
          },

          apiBackend: {
            read: (options: any) => {
              const comments = commentListRef.current;
              console.log(`[VideoPlayer] Reading ${comments.length} comments`);
              options.success(comments);
            },
            send: (options: any) => {
              console.log("[VideoPlayer] Comment send:", options);
              options.success();
            },
          },

          danmaku: {
            id: "danmaku-local",
            user: "ユーザー",
            speedRate: commentSettings.speedRate || 1,
            fontSize: commentSettings.fontSize || 25,
            closeCommentFormAfterSend:
              commentSettings.closeFormAfterSend || false,
          },
        });

        // ✅ DPlayer 初期化後、再生速度とダンマク設定を適用
        try {
          // 再生速度を設定
          if (defaultPlaybackSpeed !== 1) {
            dp.video.playbackRate = defaultPlaybackSpeed;
            console.log(
              `[VideoPlayer] Set playback speed to ${defaultPlaybackSpeed}x`,
            );
          }

          // ダンマク透明度を設定
          const opacity =
            commentSettings.opacity !== undefined
              ? commentSettings.opacity
              : 0.7;
          if (dp.danmaku && typeof dp.danmaku.opacity === "function") {
            dp.danmaku.opacity(opacity);
            console.log(`[VideoPlayer] Set danmaku opacity to ${opacity}`);
          }

          // ダンマク最大表示数を設定（DPlayer の maxCount は内部的に処理される）
          console.log(
            `[VideoPlayer] Danmaku max count: ${commentSettings.maxCount || 100}`,
          );
          console.log(
            `[VideoPlayer] Danmaku display duration: ${commentSettings.displayDuration || 5}`,
          );
        } catch (e) {
          console.warn("[VideoPlayer] Failed to apply settings:", e);
        }

        if (cancelled) {
          dp.destroy?.();
          return;
        }

        dplayerRef.current = dp;
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to initialize DPlayer";
        console.error("[VideoPlayer] Initialization error:", message);
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
      console.warn(
        "[VideoPlayer] Comments loading error (non-fatal):",
        commentsError,
      );
    }

    initializeDPlayer();

    return () => {
      cancelled = true;
      if (dplayerRef.current) {
        try {
          dplayerRef.current.destroy?.();
        } catch (e) {
          console.warn("[VideoPlayer] Error destroying DPlayer:", e);
        }
        dplayerRef.current = null;
      }
    };
  }, [
    videoFileId,
    connectionId,
    dplayerComments,
    playerSettings?.theme,
    playerSettings?.playbackSpeed,
    commentSettings?.speedRate,
    commentSettings?.fontSize,
    commentSettings?.opacity,
    commentSettings?.maxCount,
    commentSettings?.displayDuration,
    initialComments,
  ]);

  /**
   * useImperativeHandle: 親コンポーネントから DPlayer を制御
   */
  useImperativeHandle(
    ref,
    () => ({
      addComments: (comments: DPlayerCommentDto[], mergeMode = false) => {
        if (!dplayerRef.current) {
          console.warn("[VideoPlayer] DPlayer not initialized yet");
          return;
        }

        try {
          if (mergeMode) {
            // 既存コメントにマージ
            const currentComments = commentListRef.current || [];
            commentListRef.current = [...currentComments, ...comments];
            if (dplayerRef.current?.danmaku?.seek) {
              dplayerRef.current.danmaku.seek();
            }
            console.log(
              `[VideoPlayer] Merged comments. Total: ${commentListRef.current.length}`,
            );
          } else {
            // 置き換え
            commentListRef.current = comments;
            if (dplayerRef.current?.danmaku?.seek) {
              dplayerRef.current.danmaku.seek();
            }
            console.log(
              `[VideoPlayer] Replaced comments. Total: ${commentListRef.current.length}`,
            );
          }

          // DPlayer のダンマク API を使用してコメントを追加
          // DPlayer の danmaku オブジェクトのメソッドを直接呼び出す
          if (
            dplayerRef.current.danmaku &&
            typeof dplayerRef.current.danmaku.draw === "function"
          ) {
            // danmaku.draw() を呼び出してコメントを再描画
            dplayerRef.current.danmaku.clear?.();
            comments.forEach((comment) => {
              dplayerRef.current.danmaku.draw?.(comment);
            });
            console.log(
              `[VideoPlayer] Drew ${comments.length} comments on screen`,
            );
          } else {
            console.warn(
              "[VideoPlayer] DPlayer danmaku API not available, comments added to buffer",
            );
          }
        } catch (err) {
          console.error("[VideoPlayer] Error adding comments:", err);
        }
      },

      clearComments: () => {
        if (!dplayerRef.current) {
          console.warn("[VideoPlayer] DPlayer not initialized yet");
          return;
        }

        try {
          commentListRef.current = [];
          if (
            dplayerRef.current.danmaku &&
            typeof dplayerRef.current.danmaku.clear === "function"
          ) {
            dplayerRef.current.danmaku.clear?.();
            console.log("[VideoPlayer] Cleared all comments");
          }
        } catch (err) {
          console.error("[VideoPlayer] Error clearing comments:", err);
        }
      },

      getDPlayer: () => {
        return dplayerRef.current;
      },
    }),
    [],
  );

  return (
    <div className={containerClassName} style={{ position: "relative" }}>
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(220, 38, 38, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            borderRadius: "0.375rem",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.125rem", fontWeight: "bold" }}>
              エラーが発生しました
            </p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>{error}</p>
          </div>
        </div>
      )}

      {isLoading && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          <div style={{ color: "white", textAlign: "center" }}>
            <div
              style={{
                marginBottom: "0.75rem",
                animation: "spin 1s linear infinite",
              }}
            >
              ⏳
            </div>
            <p>動画を準備中...</p>
          </div>
        </div>
      )}

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

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

/**
 * forwardRef でラップして親コンポーネントから操作可能に
 */
export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  VideoPlayerComponent,
);

export default VideoPlayer;
