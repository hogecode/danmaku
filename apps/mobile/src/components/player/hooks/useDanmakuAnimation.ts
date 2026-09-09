/**
 * ダンマク（コメント）管理フック
 * DPlayer の danmaku.ts を参考に実装
 * コメント表示、アニメーション、タイミング管理
 */

import { useCallback, useState, useRef } from 'react';
import type { Danmaku } from '../types';

interface DanmakuAnimationConfig {
  speedRate?: number;  // 移動速度（1 = デフォルト）
  fontSize?: number;  // フォントサイズ（px）
  opacity?: number;  // 透明度（0-1）
  displayRange?: number;  // 表示時間範囲（秒）
  screenWidth?: number;  // 画面幅（px）
  screenHeight?: number;  // 画面高さ（px）
  unlimited?: boolean;  // 無制限表示
}

/**
 * ダンマク トンネル管理
 * （複数のダンマクが同じ行に表示されないようにする）
 */
interface DanmakuTunnel {
  right: { [key: number]: HTMLElement[] };
  top: { [key: number]: HTMLElement[] };
  bottom: { [key: number]: HTMLElement[] };
}

export function useDanmakuAnimation(config: DanmakuAnimationConfig = {}) {
  const {
    speedRate = 1,
    fontSize = 24,
    opacity = 0.8,
    displayRange = 8,
    screenWidth = 360,
    screenHeight = 640,
    unlimited = false,
  } = config;

  const [danmakuList, setDanmakuList] = useState<Danmaku[]>([]);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  // ダンマクトンネルとインデックスの管理
  const danmakuTunnelRef = useRef<DanmakuTunnel>({
    right: {},
    top: {},
    bottom: {},
  });
  const danIndexRef = useRef(0);
  const canvasRef = useRef<CanvasRenderingContext2D | null>(null);

  /**
   * Canvas コンテキストで文字幅を測定
   */
  const measureText = useCallback(
    (text: string): number => {
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvasRef.current = canvas.getContext('2d');
        if (canvasRef.current) {
          canvasRef.current.font = `bold ${fontSize}px Arial, sans-serif`;
        }
      }

      if (canvasRef.current) {
        const lines = text.split('\n');
        let maxWidth = 0;
        for (let i = 0; i < lines.length; i++) {
          const width = canvasRef.current.measureText(lines[i]).width;
          maxWidth = Math.max(maxWidth, width);
        }
        return maxWidth;
      }
      return text.length * fontSize * 0.6;
    },
    [fontSize]
  );

  /**
   * ダンマク追加
   */
  const addDanmaku = useCallback((danmaku: Danmaku | Danmaku[]) => {
    const list = Array.isArray(danmaku) ? danmaku : [danmaku];
    setDanmakuList(prev => [...prev, ...list].sort((a, b) => a.time - b.time));
  }, []);

  /**
   * ダンマク削除
   */
  const removeDanmaku = useCallback((danmaku: Danmaku) => {
    setDanmakuList(prev => prev.filter(d => d !== danmaku));
  }, []);

  /**
   * ダンマク全削除
   */
  const clearDanmaku = useCallback(() => {
    setDanmakuList([]);
    danmakuTunnelRef.current = {
      right: {},
      top: {},
      bottom: {},
    };
    danIndexRef.current = 0;
  }, []);

  /**
   * 現在時刻に基づいて表示するダンマクを計算
   */
  const computeVisibleDanmakus = useCallback(
    (currentTime: number): Danmaku[] => {
      if (!visible || paused) {
        return [];
      }

      // 表示範囲の半分を計算
      const range = displayRange / 2;
      // 現在時刻に基づいて表示するダンマクをフィルタリング
      return danmakuList.filter(
        dan => Math.abs(dan.time - currentTime) <= range
      );
    },
    [danmakuList, visible, paused, displayRange]
  );

  /**
   * トンネルから利用可能なレーンを取得
   */
  const getTunnel = useCallback(
    (tunnel: { [key: number]: HTMLElement[] }, type: string, width: number): number => {
      const danmakuHeight = fontSize + 8;
      const lineCount = Math.floor(screenHeight / danmakuHeight);

      if (unlimited) {
        const allTunnels = danmakuTunnelRef.current;
        const typeTunnels = allTunnels[type as keyof DanmakuTunnel] || {};
        let maxLine = 0;
        for (const line in typeTunnels) {
          maxLine = Math.max(maxLine, parseInt(line));
        }
        return maxLine + 1;
      }

      for (let i = 0; i < lineCount; i++) {
        const items = tunnel[i] || [];
        let canUse = true;
        for (let j = 0; j < items.length; j++) {
          const rect = items[j].getBoundingClientRect();
          if (rect.width > 0) {
            canUse = false;
            break;
          }
        }
        if (canUse) {
          return i;
        }
      }
      return -1;
    },
    [screenHeight, fontSize, unlimited]
  );

  /**
   * アニメーション時間を計算
   */
  const getAnimationDuration = useCallback(
    (position: 'normal' | 'top' | 'bottom'): number => {
      const rate = speedRate;
      const animationTimes = {
        top: 4,
        right: 5,
        bottom: 4,
      };
      const baseTime = animationTimes[position as keyof typeof animationTimes] || 5;
      return baseTime / rate;
    },
    [speedRate]
  );

  /**
   * 再生開始
   */
  const play = useCallback(() => {
    setPaused(false);
  }, []);

  /**
   * 一時停止
   */
  const pause = useCallback(() => {
    setPaused(true);
  }, []);

  /**
   * シーク処理
   */
  const seek = useCallback(
    (currentTime: number) => {
      clearDanmaku();
      for (let i = 0; i < danmakuList.length; i++) {
        if (danmakuList[i].time >= currentTime) {
          danIndexRef.current = i;
          break;
        }
        danIndexRef.current = danmakuList.length;
      }
    },
    [danmakuList, clearDanmaku]
  );

  /**
   * 表示/非表示トグル
   */
  const toggle = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  return {
    danmakuList,
    visible,
    paused,
    addDanmaku,
    removeDanmaku,
    clearDanmaku,
    computeVisibleDanmakus,
    getTunnel,
    getAnimationDuration,
    measureText,
    play,
    pause,
    seek,
    toggle,
  };
}
