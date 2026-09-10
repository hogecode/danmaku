/**
 * ダンマク（コメント）管理フック
 * リストの管理と表示・非表示制御のみ
 */

import { useCallback, useState } from 'react';
import type { Danmaku } from '../types';

interface DanmakuAnimationConfig {
  unlimited?: boolean;
}

export function useDanmakuAnimation(config: DanmakuAnimationConfig = {}) {

  const [danmakuList, setDanmakuList] = useState<Danmaku[]>([]);
  const [visible, setVisible] = useState(true);

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
    setVisible(true);
  }, []);

  return {
    danmakuList,
    visible,
    addDanmaku,
    removeDanmaku,
    clearDanmaku,
    toggle,
    reset,
  };
}
