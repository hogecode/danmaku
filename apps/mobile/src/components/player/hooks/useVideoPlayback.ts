/**
 * ビデオ再生制御フック
 * expo-video のイベントと同期した状態管理
 */

import { useCallback, useRef, useState } from 'react';
import type { PlayerState } from '../types';

const initialState: PlayerState = {
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  playbackRate: 1,
  fullscreen: false,
  pip: false,
  controlsVisible: true,
  danmakuVisible: true,
  danmakuList: [],
  visibleDanmakus: [],
  loading: false,
  buffering: 0,
};

export function useVideoPlayback() {
  const [state, setState] = useState<PlayerState>(initialState);
  const videoRef = useRef<any>(null);

  /**
   * プレイヤーの実際の状態を取得（再生状態の検証用）
   */
  const getPlayerStatus = useCallback((): boolean | null => {
    if (!videoRef.current) return null;
    // expo-video の `playing` プロパティを確認
    return videoRef.current.playing ?? null;
  }, []);

  /**
   * 再生
   * - 楽観的に state.playing を true に設定
   * - 実際のプレイヤー状態が異なる場合は修正
   */
  const play = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.play();
        setState(prev => ({ ...prev, playing: true }));
      } catch (error) {
        console.warn('[VideoPlayback] play() failed:', error);
        // 実際の状態を反映
        const actual = getPlayerStatus();
        if (actual !== null) {
          setState(prev => ({ ...prev, playing: actual }));
        }
      }
    }
  }, [getPlayerStatus]);

  /**
   * 一時停止
   * - 楽観的に state.playing を false に設定
   * - 実際のプレイヤー状態が異なる場合は修正
   */
  const pause = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        setState(prev => ({ ...prev, playing: false }));
      } catch (error) {
        console.warn('[VideoPlayback] pause() failed:', error);
        // 実際の状態を反映
        const actual = getPlayerStatus();
        if (actual !== null) {
          setState(prev => ({ ...prev, playing: actual }));
        }
      }
    }
  }, [getPlayerStatus]);

  /**
   * シーク
   */
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      // expo-video の currentTime プロパティに直接代入
      videoRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  /**
   * 音量設定
   */
  const setVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    videoRef.current?.setVolume(clamped);
    setState(prev => ({
      ...prev,
      volume: clamped,
      muted: clamped === 0,
    }));
  }, []);

  /**
   * 再生速度設定
   */
  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      // expo-video の再生速度設定
      videoRef.current.playbackRate = rate;
      setState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  /**
   * 再生時間更新
   */
  const updateTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  /**
   * 再生時間設定（ビデオのメタデータから）
   */
  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration }));
  }, []);

  /**
   * バッファリング進捗更新
   */
  const setBuffering = useCallback((percent: number) => {
    setState(prev => ({ ...prev, buffering: Math.max(0, Math.min(100, percent)) }));
  }, []);

  /**
   * ローディング状態更新
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * エラー設定
   */
  const setError = useCallback((error: string | undefined) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  /**
   * 再生終了
   */
  const onVideoEnd = useCallback(() => {
    setState(prev => ({ ...prev, playing: false, currentTime: prev.duration }));
  }, []);

  /**
   * プレイヤーの実際の状態を state に同期
   * 外部イベントや状態ズレ発生時に呼び出す
   */
  const syncPlayerStatus = useCallback(() => {
    if (!videoRef.current) return;
    
    try {
      const playerPlaying = videoRef.current.playing;
      const playerCurrentTime = videoRef.current.currentTime ?? 0;
      const playerDuration = videoRef.current.duration ?? 0;
      const playerVolume = videoRef.current.volume ?? 1;
      const playerPlaybackRate = videoRef.current.playbackRate ?? 1;

      setState(prev => ({
        ...prev,
        playing: playerPlaying ?? prev.playing,
        currentTime: playerCurrentTime,
        duration: playerDuration,
        volume: playerVolume,
        playbackRate: playerPlaybackRate,
      }));
    } catch (error) {
      console.warn('[VideoPlayback] Failed to sync player status:', error);
    }
  }, []);

  /**
   * 再生状態を同期して確認（バリデーション用）
   * handlePlayPause で状態ズレを検出する場合に使用
   */
  const verifyPlayingState = useCallback((expected: boolean): boolean => {
    const actual = getPlayerStatus();
    if (actual === null) return expected;
    
    const isValid = actual === expected;
    if (!isValid) {
      console.warn(
        `[VideoPlayback] Playing state mismatch. Expected: ${expected}, Actual: ${actual}`
      );
      setState(prev => ({ ...prev, playing: actual }));
    }
    return isValid;
  }, [getPlayerStatus]);

  return {
    // 状態
    state,
    setState,

    // ビデオ ref
    videoRef,

    // メソッド
    play,
    pause,
    seek,
    setVolume,
    setPlaybackRate,
    updateTime,
    setDuration,
    setBuffering,
    setLoading,
    setError,
    onVideoEnd,

    // ✅ 新規: 状態同期メソッド
    syncPlayerStatus,
    verifyPlayingState,
    getPlayerStatus,
  };
}
