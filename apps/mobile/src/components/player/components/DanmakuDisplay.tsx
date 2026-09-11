import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, Animated, Dimensions, Easing } from 'react-native';
import type { Danmaku } from '../types';

// ダンマク ID 生成（重複判定用）
function getCommentId(danmaku: Danmaku): string {
  return `${danmaku.time}-${danmaku.text}-${danmaku.author}`;
}

// DPlayer準拠: コメント表示時間計算
// 計算式: (screenWidth + textWidth) / アニメーション時間 = 一定速度
const COMMENT_DISPLAY_DURATION_NORMAL = 6; // 秒（DPlayer: 5.5秒）
const COMMENT_DISPLAY_DURATION_TOP_BOTTOM = 4; // 秒（DPlayer: 4秒）

function getCommentDuration(type: string, speedRate: number): number {
  switch (type) {
    case 'normal':
      return COMMENT_DISPLAY_DURATION_NORMAL / speedRate;
    case 'top':
    case 'bottom':
      return COMMENT_DISPLAY_DURATION_TOP_BOTTOM / speedRate;
    default:
      return COMMENT_DISPLAY_DURATION_NORMAL / speedRate;
  }
}

/**
 * DPlayer方式: Canvas APIに相当する正確なテキスト幅推定
 * Canvas.measureText()の挙動をReact Nativeで再現
 * 
 * フォントサイズとテキスト長から、より正確に幅を推定
 * 日本語と英字の混在に対応
 */
function estimateTextWidth(text: string, fontSize: number): number {
  // DPlayer の measureText() を参考に実装
  // canvas.font = `bold ${fontSize}px "Segoe UI", Arial`
  
  // フォント測定の近似: 1文字あたりの平均幅
  // 全角（日本語）: fontSize * 0.85 - 0.95
  // 半角（英字）: fontSize * 0.5 - 0.7
  // ここでは加重平均で0.75を使用（保守的な値）
  const baseWidth = text.length * fontSize * 0.75;
  
  // 最小幅を確保（フォントに余白を含める）
  return Math.max(baseWidth, fontSize * 2);
}

// アニメーション中のダンマク情報
interface AnimatingDanmaku {
  id: string;
  danmaku: Danmaku;
  trackIndex: number; // トラック番号（縦方向の位置を決定）
  animationValue: Animated.Value;
  displayStartTime: number;
  duration: number;
  measurementComplete: boolean; // テキスト幅測定完了フラグ
  actualTextWidth: number; // 実際のテキスト幅
}

// 個別ダンマクアイテムのプロップス
interface DanmakuItemProps {
  item: AnimatingDanmaku;
  screenWidth: number;
  displayVideoHeight: number;
  lineHeight: number;
  fontSize: number;
  opacity: number;
  speedRate: number;
  onTextLayout?: (id: string, width: number) => void;
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
  onTextLayout,
}) => {
  const { danmaku, animationValue, trackIndex, actualTextWidth, measurementComplete } = item;
  
  // ★DPlayer方式: outputRangeをロック（アニメーション中に変わらない）
  const outputRangeRef = useRef<[number, number] | null>(null);

  // normal型: 右から左へスクロール
  if (danmaku.type === 'normal') {
    const duration = getCommentDuration(danmaku.type, speedRate);
    
    // DPlayer方式: テキスト幅を推定
    const estimatedCommentWidth = estimateTextWidth(danmaku.text, fontSize);
    
    // ★重要: outputRangeをキャッシュ（一度決めたら変わらない）
    // アニメーション中にoutputRangeが変わると速度が変わるバグを防止
    if (outputRangeRef.current === null) {
      if (measurementComplete && actualTextWidth > 0) {
        // 実測値が得られた場合はそれを使用
        outputRangeRef.current = [screenWidth, -(screenWidth + actualTextWidth)];
      } else {
        // 推定値で計算（最初のアニメーション開始）
        outputRangeRef.current = [screenWidth, -(screenWidth + estimatedCommentWidth)];
      }
    }
    
    const [startPos, endPos] = outputRangeRef.current;
    
    // DPlayer準拠: アニメーション計算
    // 開始: translateX(screenWidth) ≈ 右端から開始
    // 終了: translateX(-(screenWidth + commentWidth)) ≈ 左端に完全に出きる
    // 移動距離 = screenWidth + commentWidth（テキスト全体が通り過ぎる距離）
    // 速度 = 移動距離 / duration = 一定
    const translateX = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startPos, endPos],
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
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            if (width > 0 && onTextLayout) {
              onTextLayout(item.id, width);
            }
          }}
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
  // ★注意: measurementComplete と actualTextWidth の変化は無視
  // （outputRangeは初回のみ計算されるため）
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


// DnmakuDisplayのプロップス
interface DanmakuDisplayProps {
  danmakuList: Danmaku[];
  currentTime: number;
  speedRate?: number;
  fontSize?: number;
  opacity?: number;
  visible?: boolean;
  videoHeight?: number;
}

interface Track {
  id: string;
  endTime: number;
}

// ダンマク表示コンポーネント - DPlayer完全実装版
export const DanmakuDisplay: React.FC<DanmakuDisplayProps> = ({
  danmakuList,
  currentTime,
  speedRate = 1,
  fontSize = 24,
  opacity = 1,
  visible = true,
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
  // TODO: maxTracksの上限を動的に設定できるようにする
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

      // TODO: track.endTimeの設定を見直す
      // トラックが存在しないか、前のコメントが終了している場合は利用可能
      if (!track || track.endTime <= commentStartTime) {
        return i;
      }
    }
    // 全トラック満杯の場合は、最初のトラックをリサイクル
    return 0;
  };

  /**
   * 各トラックの終了時間を更新する
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
   * テキスト幅が測定されたときのコールバック
   * actualTextWidthを更新して、アニメーション終了位置を正確に計算
   */
  const handleTextLayout = (id: string, width: number) => {
    setAnimatingDanmakus(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, actualTextWidth: width, measurementComplete: true }
          : item
      )
    );
  };

  /**
   * ★修正: 動画切り替え時のコメント表示済みフラグをリセット
   * danmakuList が変わるたびに displayedIdsRef をクリア
   */
  useEffect(() => {
    // 新しい danmakuList が来たら完全にリセット
    console.log('[DanmakuDisplay] danmakuList changed, resetting displayedIds');
    danIndexRef.current = 0;
    displayedIdsRef.current.clear();
    setAnimatingDanmakus([]);  // 進行中のアニメーションもクリア
  }, [danmakuList]);

  /**
   * DPlayer.frame() メソッドの実装
   * 現在時刻に基づいて表示すべきコメントを判定
   */
  useEffect(() => {
    if (!visible || danmakuList.length === 0) {
      return;
    }

    // 現在時刻を超えたコメントを収集
    const newDanmakus: Danmaku[] = [];
    // 先頭のコメントを取得
    let item = danmakuList[danIndexRef.current];

    // DPlayer参考: 時間条件を満たすコメントを一度に処理
    while (item && currentTime >= item.time) {
      newDanmakus.push(item);
      danIndexRef.current++;
      // 次のコメントを取得
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
      // TODO: commentEndTimeの計算方法を見直す
      // MEMO: findAvailableTrackよりもupdateTrack関数を見直す
      updateTrack(trackIndex, commentEndTime);

      // アニメーション開始
      // ★DPlayer準拠: 線形イージング（linear）で一定速度を実現
      // デフォルトのease-outでは最初は遅く、後で早くなるため
      Animated.timing(animationValue, {
        toValue: 1,
        duration: duration * 1000,
        easing: Easing.linear,
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
        measurementComplete: false,
        actualTextWidth: 0,
      };
    });

    // 既存のコメントに新しいコメントを追加
    setAnimatingDanmakus(prev => [...prev, ...newAnimatingDanmakus]);
  }, [currentTime, visible, danmakuList, speedRate]);

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
          onTextLayout={handleTextLayout}
        />
      ))}
    </View>
  );
};