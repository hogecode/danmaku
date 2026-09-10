/**
 * ビデオプレイヤー（統合版）
 * DPlayer を参考に実装
 * - ビデオ再生
 * - ダンマク表示・管理
 * - コメント送信
 * 
 * 改善: VideoPlayer の位置情報を onLayout で検知し、
 * DanmakuDisplay を absolute で正確に配置
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { VideoPlayer, type VideoPlayerRef } from './components/VideoPlayer';
import { DanmakuDisplay } from './components/DanmakuDisplay';
import { useVideoPlayback } from './hooks/useVideoPlayback';
import { useDanmakuAnimation } from './hooks/useDanmakuAnimation';
import type { PlayerConfig, Danmaku } from './types';

interface PlayerProps {
  config: PlayerConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
}

export const Player: React.FC<PlayerProps> = ({
  config,
  onReady,
  onError,
}) => {
  // ビデオプレイヤーの状態管理フック
  const videoPlayback = useVideoPlayback();
  // ダンマク管理フック
  const danmakuAnimation = useDanmakuAnimation({
    unlimited: config.danmaku?.unlimited,
  });

  // VideoPlayer コンポーネントの ref
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  // ダンマク表示用の時刻（updateTime でリアルタイム更新）
  const [displayTime, setDisplayTime] = useState(0);
  
  // ビデオプレイヤーのレイアウト情報（画面回転時に自動更新）
  const [videoLayout, setVideoLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // 初期化時にレイアウトを取得（フォールバック）
  const screenWidth = Dimensions.get('window').width;
  const videoPlayerHeight = videoLayout?.height || (screenWidth * 9) / 16;

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

  // VideoPlayer のレイアウト変更を検知（画面回転やリサイズに対応）
  const handleVideoLayoutChange = (layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    setVideoLayout(layout);
  };

  return (
    <View className="flex-1 bg-black">
      <View 
        style={{
          position: 'relative',
          flex: 1,
        }}
      >
        <VideoPlayer
          ref={videoPlayerRef}
          config={config}
          onReady={onReady}
          onError={onError}
          onLayoutChange={handleVideoLayoutChange}
          videoPlayback={videoPlayback}
        />

        {config.danmaku && videoLayout && (
          <View
            style={{
              position: 'absolute',
              top: videoLayout.y,
              left: videoLayout.x,
              width: videoLayout.width,
              height: videoLayout.height,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <DanmakuDisplay
              danmakuList={danmakuAnimation.danmakuList}
              currentTime={displayTime}
              speedRate={config.danmaku.speedRate}
              fontSize={config.danmaku.fontSize}
              opacity={config.danmaku.opacity}
              visible={danmakuAnimation.visible}
              videoHeight={videoLayout.height}
            />
          </View>
        )}
      </View>

      <View style={{ backgroundColor: '#171717', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
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
