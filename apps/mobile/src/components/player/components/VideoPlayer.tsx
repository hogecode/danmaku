/**
 * ビデオプレイヤーコンポーネント
 * expo-video を使用したビデオプレイヤー（Expo SDK 57対応）
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Dimensions, AppState } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import type { PlayerConfig } from '../types';

interface VideoPlayerProps {
  config: PlayerConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
  videoPlayback?: any;  // useVideoPlayback から外部で注入
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  config,
  onReady,
  onError,
  videoPlayback: externalVideoPlayback,
}) => {
  // ビデオ状態のフック
  const internalVideoPlayback = useVideoPlayback();
  const videoPlayback = externalVideoPlayback || internalVideoPlayback;
  const { state, play, pause, seek, setVolume, setPlaybackRate, setDuration, updateTime, setLoading, setError } = videoPlayback;

  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const playerRef = useRef<any>(null);
  
  // expo-video プレイヤー
  const player = useVideoPlayer(config.video.url);
  playerRef.current = player;

  // 再生時刻と再生状態のリアルタイム更新（ポーリング方式）
  // expo-video には statusUpdate イベントがないため、定期的に状態を取得
  useEffect(() => {
    if (!player) return;

    // 100ms ごとに currentTime と duration を更新
    const interval = setInterval(() => {
      try {
        const currentTime = player.currentTime || 0;
        const duration = player.duration || 0;

        // ビデオフックで再生時刻と再生時間を更新
        updateTime(currentTime);
        if (duration > 0) {
          setDuration(duration);
        }
      } catch (e) {
        // ignore
      }
    }, 10) // High-freq polling;

    return () => {
      clearInterval(interval);
    };
  }, [player, updateTime, setDuration]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (config.video.url) {
      setLoading(false);
      onReady?.();
    }
  }, [config.video.url]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View className="flex-1 bg-black justify-center">
      <View className="flex-1 bg-black items-center justify-center">
        <VideoView
          player={player}
          style={{
            width: screenWidth,
            height: (screenWidth * 9) / 16,
          }}
          nativeControls={true}
        />
      </View>

      {state.loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#E64F97" />
        </View>
      )}

      {state.error && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <Text className="text-red-500 text-center px-4">{state.error}</Text>
        </View>
      )}
    </View>
  );
};
