/**
 * ビデオプレイヤー状態管理（Zustand）
 */

import { create } from 'zustand';
import { DanmakuComment, VideoPlayerConfig } from '@/types';
import { appLogger } from '@/utils/logger';

export interface VideoState {
  // プレイヤー設定
  config: VideoPlayerConfig | null;

  // 状態
  currentTime: number; // 現在の再生時間（秒）
  duration: number; // 動画の長さ（秒）
  isPlaying: boolean;
  loading: boolean;
  error: string | null;

  // 弾幕
  comments: DanmakuComment[];
  visibleComments: DanmakuComment[]; // 現在表示するコメント
  commentsLoading: boolean;

  // アクション
  setConfig: (config: VideoPlayerConfig) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 弾幕アクション
  setComments: (comments: DanmakuComment[]) => void;
  setVisibleComments: (comments: DanmakuComment[]) => void;
  setCommentsLoading: (loading: boolean) => void;

  reset: () => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  // 初期状態
  config: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  loading: false,
  error: null,
  comments: [],
  visibleComments: [],
  commentsLoading: false,

  // アクション
  setConfig: (config) => {
    appLogger.info(`VideoStore: プレイヤー設定 - ${config.fileName}`);
    set({ config });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    appLogger.debug(`VideoStore: 動画の長さ = ${duration}秒`);
    set({ duration });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    if (error) {
      appLogger.warning(`VideoStore: エラー - ${error}`);
    }
    set({ error });
  },

  setComments: (comments) => {
    appLogger.debug(`VideoStore: ${comments.length} 個のコメントをロード`);
    set({ comments });
  },

  setVisibleComments: (comments) => {
    set({ visibleComments: comments });
  },

  setCommentsLoading: (loading) => {
    set({ commentsLoading: loading });
  },

  reset: () => {
    appLogger.info('VideoStore: リセット');
    set({
      config: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      loading: false,
      error: null,
      comments: [],
      visibleComments: [],
      commentsLoading: false,
    });
  },
}));
