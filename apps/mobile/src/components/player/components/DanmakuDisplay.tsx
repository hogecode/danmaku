/**
 * ダンマク（弾幕/コメント）表示コンポーネント - DPlayer実装参考版
 * DPlayerの二重表示対策とビデオ領域内限定表示を完全実装
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import type { Danmaku } from '../types';

interface DanmakuDisplayProps {
  danmakuList: Danmaku[];
  currentTime: number;
  speedRate?: number;
  fontSize?: number;
  opacity?: number;
  visible?: boolean;
  paused?: boolean;
  videoHeight?: number;
}

interface Track {
  id: string;
  endTime: number;
}

interface AnimatingDanmaku {
  id: string;
  danmaku: Danmaku;
  trackIndex: number;
  animationValue: Animated.Value;
  displayStartTime: number;
  duration: number;
}

interface DanmakuItemProps {
  item: AnimatingDanmaku;
  screenWidth: number;
  displayVideoHeight: number;
  lineHeight: number;
  fontSize: number;
  opacity: number;
  speedRate: number;
}

// ダンマク ID 生成（重複判定用）
function getCommentId(danmaku: Danmaku): string {
  return `${danmaku.time}-${danmaku.text}-${danmaku.author}`;
}

// コメント表示時間計算（DPlayer基準）
// normal: 約8秒（右から左へスクロール）, top/bottom: 約4秒（固定）
function getCommentDuration(type: string, speedRate: number): number {
  switch (type) {
    case 'normal':
      return 8 / speedRate;
    case 'top':
    case 'bottom':
      return 4 / speedRate;
    default:
      return 8 / speedRate;
  }
}

// 個別ダンマク描画
const DanmakuItem = React.memo<DanmakuItemProps>(({
  item,
  screenWidth,
  displayVideoHeight,
  lineHeight,
  fontSize,
  opacity,
  speedRate,
}) => {
  const { danmaku, animationValue, trackIndex } = item;

  // normal型: 右から左へスクロール
  if (danmaku.type === 'normal') {
    const duration = getCommentDuration(danmaku.type, speedRate);
    
    // アニメーション計算
    const translateX = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [screenWidth, -300],
    });

    // トラック位置を計算（ビデオ領域内に限定）
    // trackIndex が maxTracks を超えないように制限済み
    const top = Math.min(
      trackIndex * lineHeight,
      displayVideoHeight - lineHeight  // 下端に収まるよう制限
    );

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top,
          left: 0,
          width: screenWidth,
          height: lineHeight,
          transform: [{ translateX }],
        }}
        pointerEvents="none"
      >
        <Text
          style={{
            fontSize,
            color: danmaku.color || '#FFFFFF',
            fontWeight: 'bold',
            opacity,
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
          numberOfLines={1}
        >
          {danmaku.text}
        </Text>
      </Animated.View>
    );
  }

  // top/bottom型: 固定位置表示
  const top =
    danmaku.type === 'top'
      ? 10  // 上部 10px
      : Math.max(10, displayVideoHeight - lineHeight - 10);  // 下部 10px（下端に収まるよう）

  return (
    <View
      style={{
        position: 'absolute',
        top,
        left: screenWidth / 2,
        width: screenWidth,
        height: lineHeight,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <Text
        style={{
          fontSize,
          color: danmaku.color || '#FFFFFF',
          fontWeight: 'bold',
          opacity,
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
        numberOfLines={1}
      >
        {danmaku.text}
      </Text>
    </View>
  );
}, (prevProps, nextProps) => {
  // React.memo カスタム比較関数
  // 同じ props の場合は true を返す（再レンダリングをスキップ）
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.screenWidth === nextProps.screenWidth &&
    prevProps.displayVideoHeight === nextProps.displayVideoHeight &&
    prevProps.lineHeight === nextProps.lineHeight &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.opacity === nextProps.opacity &&
    prevProps.speedRate === nextProps.speedRate
  );
})


// ダンマク表示コンポーネント - DPlayer完全実装版
export const DanmakuDisplay: React.FC<DanmakuDisplayProps> = ({
  danmakuList,
  currentTime,
  speedRate = 1,
  fontSize = 16,
  opacity = 0.8,
  visible = true,
  paused = false,
  videoHeight = 0,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const displayVideoHeight = videoHeight || (screenWidth * 9) / 16;
  
  const [animatingDanmakus, setAnimatingDanmakus] = useState<AnimatingDanmaku[]>([]);
  
  // DPlayer実装参考: トラック管理（各トラックの終了時間を記録）
  const tracksRef = useRef<Track[]>([]);
  
  // 既に表示済みのコメントID（二重表示防止）
  const displayedIdsRef = useRef<Set<string>>(new Set());
  
  // 次に表示すべきコメントのインデックス（DPlayerの frame() メソッド参考）
  const danIndexRef = useRef(0);
  
  // ビデオ領域内に表示可能なトラック数を計算
  const lineHeight = fontSize + 4;
  const maxTracks = Math.floor(displayVideoHeight / lineHeight);

  /**
   * 利用可能なトラックを検索する（DPlayer参考）
   * 時間軸でコメントが重ならない位置を見つける
   */
  const findAvailableTrack = (commentStartTime: number, commentDuration: number): number => {
    // 各トラックをチェック
    for (let i = 0; i < maxTracks; i++) {
      const track = tracksRef.current[i];
      // トラックが存在しないか、前のコメントが終了している場合は利用可能
      if (!track || track.endTime <= commentStartTime) {
        return i;
      }
    }
    // 全トラック満杯の場合は、最初のトラックをリサイクル
    return 0;
  };

  /**
   * トラック終了時間を更新する
   */
  const updateTrack = (trackIndex: number, endTime: number) => {
    if (!tracksRef.current[trackIndex]) {
      tracksRef.current[trackIndex] = { id: '', endTime };
    } else {
      tracksRef.current[trackIndex].endTime = Math.max(
        tracksRef.current[trackIndex].endTime,
        endTime
      );
    }
  };

  /**
   * DPlayer.frame() メソッドの実装
   * 現在時刻に基づいて表示すべきコメントを判定
   */
  useEffect(() => {
    if (!visible || paused || danmakuList.length === 0) {
      return;
    }

    // 現在時刻を超えたコメントを収集
    const newDanmakus: Danmaku[] = [];
    let item = danmakuList[danIndexRef.current];

    // DPlayer参考: 時間条件を満たすコメントを一度に処理
    while (item && currentTime >= item.time) {
      newDanmakus.push(item);
      danIndexRef.current++;
      item = danmakuList[danIndexRef.current];
    }

    // 新しいコメントがない場合は何もしない
    if (newDanmakus.length === 0) {
      return;
    }

    // 既に表示済みのコメントをフィルタリング（二重表示防止）
    const uniqueDanmakus = newDanmakus.filter(dan => {
      const id = getCommentId(dan);
      if (displayedIdsRef.current.has(id)) {
        return false; // 既に表示済み
      }
      displayedIdsRef.current.add(id);
      return true;
    });

    if (uniqueDanmakus.length === 0) {
      return;
    }

    // 新しいアニメーションコメントを作成
    const newAnimatingDanmakus: AnimatingDanmaku[] = uniqueDanmakus.map(dan => {
      const id = getCommentId(dan);
      const duration = getCommentDuration(dan.type || 'normal', speedRate);
      const animationValue = new Animated.Value(0);

      const commentStartTime = currentTime;
      const commentEndTime = commentStartTime + duration;

      // トラックを割り当て
      const trackIndex = findAvailableTrack(commentStartTime, duration);
      updateTrack(trackIndex, commentEndTime);

      // アニメーション開始
      Animated.timing(animationValue, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: true,
      }).start(() => {
        // アニメーション終了時にコメントを削除
        setAnimatingDanmakus(prev => prev.filter(item => item.id !== id));
      });

      return {
        id,
        danmaku: dan,
        trackIndex,
        animationValue,
        displayStartTime: currentTime,
        duration,
      };
    });

    // 既存のコメントに新しいコメントを追加
    setAnimatingDanmakus(prev => [...prev, ...newAnimatingDanmakus]);
  }, [currentTime, visible, paused, danmakuList, speedRate]);

  if (!visible) return null;

  return (
    <View 
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth,
        height: displayVideoHeight,
        overflow: 'hidden',
      }}
    >
      {animatingDanmakus.map(item => (
        <DanmakuItem
          key={item.id}
          item={item}
          screenWidth={screenWidth}
          displayVideoHeight={displayVideoHeight}
          lineHeight={lineHeight}
          fontSize={fontSize}
          opacity={opacity}
          speedRate={speedRate}
        />
      ))}
    </View>
  );
};