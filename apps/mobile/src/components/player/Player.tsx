/**
 * ビデオプレイヤー（統合版）
 * DPlayer を参考に実装
 * - ビデオ再生
 * - ダンマク表示・管理
 * - コメント送信
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { VideoPlayer } from './components/VideoPlayer';
import { DanmakuDisplay } from './components/DanmakuDisplay';
import { DanmakuForm } from './components/DanmakuForm';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import { useDanmakuAnimation } from './hooks/useDanmakuAnimation';
import type { PlayerConfig, Danmaku } from './types';

interface PlayerProps {
  config: PlayerConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
  onDanmakuSend?: (danmaku: Danmaku) => void;
}

export const Player: React.FC<PlayerProps> = ({
  config,
  onReady,
  onError,
  onDanmakuSend,
}) => {
  const videoPlayback = useVideoPlayback();
  const danmakuAnimation = useDanmakuAnimation({
    speedRate: config.danmaku?.speedRate || 1,
    fontSize: config.danmaku?.fontSize || 16,
    opacity: config.danmaku?.opacity !== undefined ? config.danmaku.opacity : 0.8,
    unlimited: config.danmaku?.unlimited,
  });

  const [showDanmakuForm, setShowDanmakuForm] = useState(false);

  useEffect(() => {
    if (config.apiBackend?.read) {
      config.apiBackend.read({
        success: (comments: Danmaku[]) => {
          danmakuAnimation.addDanmaku(comments);
        },
        error: (msg: string) => {
          console.error('Failed to load danmakus:', msg);
        },
      });
    }
  }, [config.apiBackend]);

  const handleDanmakuSend = async (danmaku: Danmaku) => {
    danmakuAnimation.addDanmaku(danmaku);

    if (config.apiBackend?.send) {
      config.apiBackend.send({
        comment: danmaku,
        success: () => {
          onDanmakuSend?.(danmaku);
        },
        error: (msg: string) => {
          console.error('Failed to send danmaku:', msg);
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-black">
      <View className="relative">
        <VideoPlayer
          config={config}
          onReady={onReady}
          onError={onError}
        />

        {config.danmaku && (
          <DanmakuDisplay
            danmakuList={danmakuAnimation.danmakuList}
            currentTime={videoPlayback.state.currentTime}
            speedRate={config.danmaku.speedRate}
            fontSize={config.danmaku.fontSize}
            opacity={config.danmaku.opacity}
            visible={danmakuAnimation.visible}
            paused={danmakuAnimation.paused}
          />
        )}
      </View>

      <View className="bg-neutral-900 px-4 py-3 gap-3">
        {config.danmaku && (
          <TouchableOpacity
            onPress={() => setShowDanmakuForm(true)}
            className="bg-pink-500 rounded px-4 py-2 items-center"
          >
            <Text className="text-white font-semibold">コメント送信</Text>
          </TouchableOpacity>
        )}

        {config.danmaku && (
          <TouchableOpacity
            onPress={() => danmakuAnimation.toggle()}
            className={`rounded px-4 py-2 items-center ${
              danmakuAnimation.visible ? 'bg-blue-600' : 'bg-neutral-700'
            }`}
          >
            <Text className="text-white font-semibold">
              {danmakuAnimation.visible ? 'コメント表示中' : 'コメント非表示'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {config.danmaku && (
        <DanmakuForm
          visible={showDanmakuForm}
          onSubmit={handleDanmakuSend}
          onCancel={() => setShowDanmakuForm(false)}
          currentTime={videoPlayback.state.currentTime}
        />
      )}
    </View>
  );
};
