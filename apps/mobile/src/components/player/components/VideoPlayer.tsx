/**
 * ビデオプレイヤーコンポーネント
 * Expo Go 互換の簡易実装
 * 注: 開発ビルドが必要な場合は expo-av を使用してください
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Dimensions, Linking, ScrollView } from 'react-native';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import type { PlayerConfig } from '../types';

interface VideoPlayerProps {
  config: PlayerConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  config,
  onReady,
  onError,
}) => {
  const videoRef = useRef(null);
  const { state, play, pause, seek, setVolume, setPlaybackRate, setDuration, updateTime, setLoading, setError } = useVideoPlayback();
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Expo Go では環境変数からプレイヤーの状態を初期化
    if (config.video.url) {
      setLoading(false);
      onReady?.();
    }
  }, [config.video.url]);

  const handleOpenVideo = async () => {
    try {
      const canOpen = await Linking.canOpenURL(config.video.url);
      if (canOpen) {
        await Linking.openURL(config.video.url);
      } else {
        setError('ビデオを開くことができません');
      }
    } catch (err) {
      setError('エラーが発生しました');
    }
  };

  return (
    <View className="flex-1 bg-black justify-center">
      {/* Expo Go 対応：簡易ビデオプレイヤー表示 */}
      <View className="flex-1 items-center justify-center px-4 gap-6">
        {config.video.pic && (
          <View className="w-full aspect-video bg-neutral-800 rounded-lg overflow-hidden">
            <Text className="flex-1 text-white text-center items-center justify-center">
              {config.video.pic}
            </Text>
          </View>
        )}

        <View className="gap-4 w-full">
          <Text className="text-white text-center text-base font-semibold">
            Expo Go ではネイティブビデオプレイヤーをサポートしていません
          </Text>
          <Text className="text-gray-400 text-center text-sm">
            開発ビルドを作成してください：
          </Text>
          <Text className="text-gray-300 text-center text-xs font-mono px-3 py-2 bg-neutral-900 rounded">
            eas build --platform android --profile preview
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenVideo}
          className="w-full bg-pink-500 rounded-lg py-3 items-center"
        >
          <Text className="text-white font-semibold text-base">
            ビデオを外部プレイヤーで開く
          </Text>
        </TouchableOpacity>
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

        <TouchableOpacity
          onPress={() => (state.playing ? pause() : play())}
          className="bg-pink-500 rounded px-4 py-2 items-center"
        >
          <Text className="text-white font-semibold">
            {state.playing ? '一時停止' : '再生'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatTime(seconds: number): string {
  if (!seconds || seconds === Infinity) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
