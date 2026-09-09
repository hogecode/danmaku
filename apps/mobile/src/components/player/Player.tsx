/**
 * ビデオプレイヤー（統合版）
 * DPlayer を参考に実装
 * - ビデオ再生
 * - ダンマク表示・管理
 * - コメント送信
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { VideoPlayer } from './components/VideoPlayer';
import { DanmakuDisplay } from './components/DanmakuDisplay';
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
  // ビデオプレイヤーの状態管理フック
  const videoPlayback = useVideoPlayback();
  // ダンマク管理フック
  const danmakuAnimation = useDanmakuAnimation({
    speedRate: config.danmaku?.speedRate || 1,
    fontSize: config.danmaku?.fontSize || 16,
    opacity: config.danmaku?.opacity !== undefined ? config.danmaku.opacity : 0.8,
    unlimited: config.danmaku?.unlimited,
  });

  // ダンマク表示用の時刻（updateTime でリアルタイム更新）
  const [displayTime, setDisplayTime] = useState(0);
  
  // ビデオプレイヤーの高さ（16:9 アスペクト比）
  const screenWidth = Dimensions.get('window').width;
  const videoPlayerHeight = (screenWidth * 9) / 16;

  // API からダンマクを取得
  // NOTE: config.apiBackend のみを依存配列に（danmakuAnimation は省略）
  useEffect(() => {
    if (config.apiBackend?.read) {
      config.apiBackend.read({
        success: (comments: Danmaku[]) => {
          danmakuAnimation.addDanmaku(comments);
        },
        error: (msg: string) => {
          console.error('[Player] Failed to load danmakus:', msg);
        },
      });
    }
  }, [config.apiBackend]);

  // ビデオの再生時刻をダンマク表示に同期
  useEffect(() => {
    setDisplayTime(videoPlayback.state.currentTime);
    if (videoPlayback.state.currentTime > 0) {
      //console.log('[Player] currentTime updated:', videoPlayback.state.currentTime);
    }
  }, [videoPlayback.state.currentTime]);

  // ページ離脱時のクリーンアップ（動画停止 + 状態リセット）
  // NOTE: 空の依存配列でマウント解除時のみ実行
  useEffect(() => {
    return () => {
      console.log('[Player] Cleanup: stopping video');
      try {
        videoPlayback.pause();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // ダンマク送信処理
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
      <View className="relative flex-1">
        <VideoPlayer
          config={config}
          onReady={onReady}
          onError={onError}
          videoPlayback={videoPlayback}
        />

        {config.danmaku && (
          <DanmakuDisplay
            danmakuList={danmakuAnimation.danmakuList}
            currentTime={displayTime}
            speedRate={config.danmaku.speedRate}
            fontSize={config.danmaku.fontSize}
            opacity={config.danmaku.opacity}
            visible={danmakuAnimation.visible}
            paused={danmakuAnimation.paused}
            videoHeight={videoPlayerHeight}
          />
        )}
      </View>

      <View className="bg-neutral-900 px-4 py-3 gap-3">
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
    </View>
  );
};
