/**
 * ダンマク（弾幕/コメント）表示コンポーネント
 * DPlayer の danmaku.ts を参考に、React Native で実装
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useDanmakuAnimation } from '../hooks/useDanmakuAnimation';
import type { Danmaku } from '../types';

interface DanmakuDisplayProps {
  danmakuList: Danmaku[];
  currentTime: number;
  speedRate?: number;
  fontSize?: number;
  opacity?: number;
  visible?: boolean;
  paused?: boolean;
}

interface AnimatedDanmakuItem {
  id: string;
  danmaku: Danmaku;
  animationValue: Animated.Value;
}

export const DanmakuDisplay: React.FC<DanmakuDisplayProps> = ({
  danmakuList,
  currentTime,
  speedRate = 1,
  fontSize = 16,
  opacity = 0.8,
  visible = true,
  paused = false,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const [animatedDanmakus, setAnimatedDanmakus] = useState<AnimatedDanmakuItem[]>([]);
  // ダンマクアニメーション用のフックを初期化
  const { computeVisibleDanmakus, getAnimationDuration } = useDanmakuAnimation({
    speedRate,
    fontSize,
    opacity,
    screenWidth,
  });

  // 現在表示すべきダンマクを取得
  const visibleDanmakus = computeVisibleDanmakus(currentTime);

  useEffect(() => {
    if (!visible || paused) {
      return;
    }

    const existingIds = new Set(animatedDanmakus.map(d => d.id));
    const newDanmakus = visibleDanmakus.filter(
      dan => !existingIds.has(getItemId(dan))
    );

    newDanmakus.forEach(dan => {
      const animationValue = new Animated.Value(0);
      const duration = getAnimationDuration(dan.type) * 1000;

      Animated.timing(animationValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(() => {
        setAnimatedDanmakus(prev =>
          prev.filter(d => d.id !== getItemId(dan))
        );
      });

      setAnimatedDanmakus(prev => [
        ...prev,
        {
          id: getItemId(dan),
          danmaku: dan,
          animationValue,
        },
      ]);
    });

    setAnimatedDanmakus(prev =>
      prev.filter(item => {
        const isVisible = visibleDanmakus.some(
          dan => getItemId(dan) === item.id
        );
        return isVisible;
      })
    );
  }, [visibleDanmakus, visible, paused]);

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 overflow-hidden pointer-events-none">
      {animatedDanmakus.map(item => (
        <AnimatedDanmakuItem
          key={item.id}
          item={item}
          screenWidth={screenWidth}
          fontSize={fontSize}
          opacity={opacity}
        />
      ))}
    </View>
  );
};

interface AnimatedDanmakuItemProps {
  item: AnimatedDanmakuItem;
  screenWidth: number;
  fontSize: number;
  opacity: number;
}

const AnimatedDanmakuItem: React.FC<AnimatedDanmakuItemProps> = ({
  item,
  screenWidth,
  fontSize,
  opacity,
}) => {
  const { danmaku, animationValue } = item;
  const itemHeight = fontSize + 8;

  const getTranslateX = () => {
    if (danmaku.type === 'normal') {
      return animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, -200],
      });
    }
    return new Animated.Value(0);
  };

  const getTop = (): number => {
    if (danmaku.type === 'top') {
      return 20;
    } else if (danmaku.type === 'bottom') {
      return Dimensions.get('window').height - itemHeight - 20;
    }
    return Math.random() * (Dimensions.get('window').height - itemHeight);
  };

  const animatedStyle = {
    transform:
      danmaku.type === 'normal'
        ? [{ translateX: getTranslateX() }]
        : [],
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          ...(danmaku.type === 'top' && { top: 20 }),
          ...(danmaku.type === 'bottom' && {
            bottom: 20,
          }),
          ...(danmaku.type === 'normal' && {
            top: getTop(),
          }),
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize,
          color: danmaku.color,
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
};

function getItemId(danmaku: Danmaku): string {
  return `${danmaku.time}_${danmaku.author}_${danmaku.text}`;
}
