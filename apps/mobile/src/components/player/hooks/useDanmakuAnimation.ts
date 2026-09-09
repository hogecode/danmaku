/**
 * ダンマク（コメント）管理フック
 * リストの管理と表示・非表示制御のみ
 */

import { useCallback, useState } from 'react';
import type { Danmaku } from '../types';

interface DanmakuAnimationConfig {
  speedRate?: number;
  fontSize?: number;
  opacity?: number;
  unlimited?: boolean;
}

export function useDanmakuAnimation(config: DanmakuAnimationConfig = {}) {
  const {
    speedRate = 1,
    fontSize = 24,
    opacity = 0.8,
    unlimited = false,
  } = config;

  const [danmakuList, setDanmakuList] = useState<Danmaku[]>([]);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  // TODO: 将来的には表示時間をダンマクの種類や画面サイズに応じて動的に計算する
  const DEFAULT_DISPLAY_DURATION = 8; // 8秒が基本
  
  /**
   * ダンマク追加
   * この関数はreadで、APIから取得したダンマクを追加するために使用される
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
  }, []);

  /**
   * 現在時刻に基づいて表示するダンマクを計算
   * displayRange: ダンマクが画面に表示される時間（秒）
   * speedRate: 移動速度（高いほど速い）
   */
  const computeVisibleDanmakus = useCallback(
    (currentTime: number): Danmaku[] => {
      if (!visible || paused) {
        return [];
      }

      // ダンマクの表示時間 = アニメーション時間 + 余白
      const displayDuration = DEFAULT_DISPLAY_DURATION / speedRate; // 8秒が基本
      
      // 表示範囲：現在時刻から displayDuration 秒前のダンマクまで
      return danmakuList.filter(
        dan => dan.time <= currentTime && dan.time > currentTime - displayDuration
      );
    },
    [danmakuList, visible, paused, speedRate]
  );

  /**
   * アニメーション時間を計算
   */
  const getAnimationDuration = useCallback(
    (position: 'normal' | 'top' | 'bottom'): number => {
      const animationTimes = {
        top: 4,
        normal: 8,
        bottom: 4,
      };
      const baseTime = animationTimes[position] || 8;
      return baseTime / speedRate;
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
   * 表示/非表示トグル
   */
  const toggle = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  /**
   * リセット（ページ離脱時）
   */
  const reset = useCallback(() => {
    clearDanmaku();
    setPaused(false);
    setVisible(true);
  }, []);

  return {
    danmakuList,
    visible,
    paused,
    addDanmaku,
    removeDanmaku,
    clearDanmaku,
    computeVisibleDanmakus,
    getAnimationDuration,
    play,
    pause,
    toggle,
    reset,
  };
}
