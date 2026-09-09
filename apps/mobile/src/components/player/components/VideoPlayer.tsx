/**
 * ビデオプレイヤーコンポーネント
 * expo-video を使用したビデオプレイヤー（Expo SDK 57対応）
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import type { PlayerConfig } from '../types';

interface VideoPlayerProps {
  config: PlayerConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
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
}) => {
  const { state, play, pause, seek, setVolume, setPlaybackRate, setDuration, updateTime, setLoading, setError } = useVideoPlayback();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  // expo-video プレイヤー
  const player = useVideoPlayer(config.video.url, (player) => {
    player.loop = false;
    player.volume = state.volume;
    player.playbackRate = state.playbackRate;
  });

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

      <View className="bg-neutral-900 px-4 py-3 gap-3">
        <Text className="text-white text-sm">
          {formatTime(state.currentTime)} / {formatTime(state.duration)}
        </Text>

        <View className="h-1 bg-neutral-700 rounded">
          <View
            className="h-full bg-pink-500 rounded"
            style={{
              width: `${(state.currentTime / state.duration) * 100}%`,
            }}
          />
        </View>
      </View>
    </View>
  );
};
    