/**
 * ビデオ再生制御フック
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
   * 再生
   */
  const play = useCallback(() => {
    videoRef.current?.play();
    setState(prev => ({ ...prev, playing: true }));
  }, []);

  /**
   * 一時停止
   */
  const pause = useCallback(() => {
    videoRef.current?.pause();
    setState(prev => ({ ...prev, playing: false }));
  }, []);

  /**
   * シーク
   */
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
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
    videoRef.current?.setRate(rate);
    setState(prev => ({ ...prev, playbackRate: rate }));
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
  };
}
