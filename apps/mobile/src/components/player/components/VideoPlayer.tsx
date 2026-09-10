/**
 * ビデオプレイヤーコンポーネント
 * expo-video を使用したビデオプレイヤー（Expo SDK 57対応）
 * 
 * ビデオの位置・サイズ情報をリアルタイムで親コンポーネントに通知
 */

import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { View, ActivityIndicator, Text, Dimensions, LayoutChangeEvent } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useVideoPlayback } from '../hooks/useVideoPlayback';
import CustomVideoControls from './CustomVideoControls';
import type { PlayerConfig } from '../types';

export interface VideoPlayerRef {
  getLayout: () => { x: number; y: number; width: number; height: number } | null;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
}

interface VideoPlayerProps {
  config: PlayerConfig;
  onReady?: () => void;
  onError?: (error: string) => void;
  onLayoutChange?: (layout: { x: number; y: number; width: number; height: number }) => void;
  onDanmakuOpacityChange?: (opacity: number) => void;
  videoPlayback?: any;  // useVideoPlayback から外部で注入
  danmakuAnimation?: any;  // useDanmakuAnimation から外部で注入
}

export const VideoPlayer = React.forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      config,
      onReady,
      onError,
      onLayoutChange,
      onDanmakuOpacityChange,
      videoPlayback: externalVideoPlayback,
      danmakuAnimation,
    },
    ref,
  ) => {
    // ビデオ状態のフック
    const internalVideoPlayback = useVideoPlayback();
    const videoPlayback = externalVideoPlayback || internalVideoPlayback;
    const {
      state,
      play,
      pause,
      seek,
      setVolume,
      setPlaybackRate,
      setDuration,
      updateTime,
      setLoading,
      setError,
    } = videoPlayback;

    const [screenWidth, setScreenWidth] = useState(
      Dimensions.get("window").width,
    );
    const [videoLayout, setVideoLayout] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    const playerRef = useRef<any>(null);
    const videoContainerRef = useRef<View>(null);
    const videoViewRef = useRef<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPip, setIsPip] = useState(false);

    // expo-video プレイヤー
    const player = useVideoPlayer(config.video.url, (player) => {
      player.loop = true;
      player.play();
    });
    playerRef.current = player;

    // ★重要: useVideoPlayback フックの videoRef に player を設定
    useEffect(() => {
      videoPlayback.videoRef.current = player;
    }, [player, videoPlayback.videoRef]);

    // useImperativeHandle で親コンポーネントから位置情報にアクセス可能に
    useImperativeHandle(
      ref,
      () => ({
        getLayout: () => videoLayout,
        enterFullscreen: async () => {
          if (videoViewRef.current) {
            await videoViewRef.current.enterFullscreen();
          }
        },
        exitFullscreen: async () => {
          if (videoViewRef.current) {
            await videoViewRef.current.exitFullscreen();
          }
        },
      }),
      [videoLayout],
    );

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
      }, 10); // High-freq polling;

      return () => {
        clearInterval(interval);
      };
    }, [player, updateTime, setDuration]);

    // 画面リサイズ時にスクリーン幅を更新（自動的に VideoView の layout も更新される）
    useEffect(() => {
      const subscription = Dimensions.addEventListener(
        "change",
        ({ window }) => {
          setScreenWidth(window.width);
        },
      );
      return () => subscription?.remove();
    }, []);

    // フルスクリーン解除時に screenWidth を正しく更新
    // TODO: 反映されるまでに多少時間がかかるので見直す
    // これがないとフルスクリーン解除後に何故か動画が正しい幅で表示されない
    useEffect(() => {
      if (!isFullscreen) {
        const currentWidth = Dimensions.get("window").width;
        setScreenWidth(currentWidth);
      }
    }, [isFullscreen]);

    useEffect(() => {
      if (config.video.url) {
        setLoading(false);
        onReady?.();
      }
    }, [config.video.url]);

    // ビデオコンテナのレイアウト変更を検知
    const handleContainerLayout = (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      const layout = { x, y, width, height };
      setVideoLayout(layout);
      onLayoutChange?.(layout);
    };

    const handlePipToggle = async (enterPip: boolean) => {
      try {
        if (enterPip) {
          await videoViewRef.current?.startPictureInPicture();
          setIsPip(true);
        } else {
          await videoViewRef.current?.stopPictureInPicture();
          setIsPip(false);
        }
      } catch (error) {
        console.error("PiP toggle error:", error);
        setIsPip(!isPip);
      }
    };

    const videoHeight = (screenWidth * 9) / 16;

    return (
      <View
        ref={videoContainerRef}
        style={{
          flex: 1,
          backgroundColor: "black",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: isFullscreen ? Dimensions.get('window').height : screenWidth,
            height: isFullscreen ? Dimensions.get('window').width : videoHeight,
            backgroundColor: "black",
            alignItems: "center",
          }}
          onLayout={handleContainerLayout}
        >
          {/* ビデオビュー */}
          <VideoView
            ref={videoViewRef}
            player={player}
            style={{
              width: isFullscreen ? Dimensions.get('window').height : screenWidth,
              height: isFullscreen ? Dimensions.get('window').width : videoHeight,
            }}
            nativeControls={isFullscreen}
            fullscreenOptions={{ enable: false }}
            allowsPictureInPicture
            startsPictureInPictureAutomatically={true}
            onFullscreenEnter={() => {
              setIsFullscreen(true);
            }}
            onFullscreenExit={() => {
              setIsFullscreen(false);
            }}
          />

          {/* カスタムプレイヤーコントロール（フルスクリーン時は非表示） */}
          {!isFullscreen && (
            <CustomVideoControls
              videoPlayback={videoPlayback}
              config={config}
              onDanmakuOpacityChange={onDanmakuOpacityChange}
              isFullscreen={isFullscreen}
              isPip={isPip}
              danmakuAnimation={danmakuAnimation}
              onFullscreenToggle={async (enterFullscreen) => {
                if (enterFullscreen) {
                  setIsFullscreen(true);
                  await videoViewRef.current?.enterFullscreen();
                } else {
                  setIsFullscreen(false);
                  await videoViewRef.current?.exitFullscreen();
                }
              }}
              onPipToggle={handlePipToggle}
            />
          )}
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
  },
);

VideoPlayer.displayName = 'VideoPlayer';
