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
import { usePlayerSettingsStore } from '@/stores/player-settings-store';
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

  // プレイヤー設定ストア
  const { loadSettings } = usePlayerSettingsStore();
  // Zustand selector で settings を購読（更新を反映）
  const playerSettings = usePlayerSettingsStore((state) => state.settings);

  // VideoPlayer コンポーネントの ref
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  // ダンマク表示用の時刻（updateTime でリアルタイム更新）
  const [displayTime, setDisplayTime] = useState(0);
  
  // ビデオプレイヤーのレイアウト情報（画面回転時に自動更新）
  const [videoLayout, setVideoLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // マウント時に設定をロード
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 初期化時にレイアウトを取得（フォールバック）
  const screenWidth = Dimensions.get('window').width;
  const videoPlayerHeight = videoLayout?.height || (screenWidth * 9) / 16;

  // API からダンマクを取得
  // ★修正: 新しい動画読み込み時に前のコメントをリセット、その後に新規コメント追加
  useEffect(() => {
    if (config.apiBackend?.read) {
      // 前の動画のコメントをリセット
      danmakuAnimation.reset();
      
      config.apiBackend.read({
        success: (comments: Danmaku[]) => {
          console.log('[Player] Loaded danmakus:', comments.length);
          danmakuAnimation.addDanmaku(comments);
        },
        error: (msg: string) => {
          console.error('[Player] Failed to load danmakus:', msg);
        },
      });
    }
  }, [config.apiBackend]);

  // ビデオの再生時刻をダンマク表示に同期
  // 再生中のみ更新（停止時は displayTime を保持してアニメーション停止）
  useEffect(() => {
    if (videoPlayback.state.playing) {
      setDisplayTime(videoPlayback.state.currentTime);
    }
  }, [videoPlayback.state.currentTime, videoPlayback.state.playing]);

  // ページ離脱時のクリーンアップ（動画停止 + 状態リセット）
  // NOTE: 空の依存配列でマウント解除時のみ実行
  useEffect(() => {
    return () => {
      console.log('[Player] Cleanup: stopping video and clearing danmakus');
      try {
        videoPlayback.pause();
      } catch (e) {
        // ignore
      }
      // ★修正: ページ離脱時にコメントをクリア
      danmakuAnimation.reset();
    };
  }, []); // 空配列: マウント解除時のみ実行

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
          danmakuAnimation={danmakuAnimation}
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
              isPlaying={videoPlayback.state.playing}
              speedRate={config.danmaku.speedRate}
              fontSize={config.danmaku.fontSize}
              opacity={playerSettings.danmakuOpacity ?? 1}
              visible={danmakuAnimation.visible}
              videoHeight={videoLayout.height}
              maxTracks={config.danmaku.maxTracks}
              defaultColor={playerSettings.danmakuDefaultColor ?? '#FFFFFF'}
            />
          </View>
        )}
      </View>
    </View>
  );
};
