/**
 * ビデオプレイヤーコンポーネント
 * expo-video を使用したビデオプレイヤー（Expo SDK 57対応）
 * 
 * ビデオの位置・サイズ情報をリアルタイムで親コンポーネントに通知
 */

import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { View, ActivityIndicator, Text, Dimensions, LayoutChangeEvent } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Video from 'expo-video';
import { useEventListener } from 'expo';
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
      setBuffering,
      setLoading,
      setError,
      syncPlayerStatus,
      verifyPlayingState,
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
      // ✅ timeUpdate イベントを 250ms 間隔で発火（bufferedPosition 取得用）
      player.timeUpdateEventInterval = 0.25;
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

    // ✅ expo-video の timeUpdate イベントでバッファ情報を取得
    // timeUpdateEventInterval = 0.25 で 250ms ごとにイベント発火
    useEventListener(
      player,
      'timeUpdate',
      ({ bufferedPosition, currentTime }) => {
        // 再生時刻を更新
        updateTime(currentTime);

        // 総時間を更新（TimeUpdateEventPayload には duration がないので player から取得）
        const duration = player?.duration || 0;
        if (duration > 0) {
          setDuration(duration);
        }

        // ✅ bufferedPosition からバッファ進捗をパーセンテージに変換
        if (duration > 0) {
          const bufferingPercent = Math.min(
            100,
            (bufferedPosition / duration) * 100
          );
          setBuffering(bufferingPercent);
          // console.log('[Buffer] Progress:', bufferingPercent.toFixed(1), '%');
        }
      }
    );

    // ✅ expo-video の statusChange イベントで再生状態を同期
    // このイベントは play()/pause() 実行時や自動イベント時に発火
    useEventListener(player, 'statusChange', () => {
      // プレイヤーの実際の状態を state に同期
      syncPlayerStatus();
    });

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
        // ✅ PiP サポート確認
        const isPipSupported = Video.isPictureInPictureSupported();
        console.log('[PiP] Device supports PiP:', isPipSupported);
        
        if (!isPipSupported) {
          console.error('[PiP] Device does not support Picture in Picture');
          return;
        }
        
        if (enterPip) {
          console.log('[PiP] Starting Picture in Picture...');     
          // ✅ expo-video API を呼び出し
          await videoViewRef.current?.startPictureInPicture();
          // Expo Go では onPictureInPictureStart が呼ばれないので手動更新
          setIsPip(true);
        } else { 
          // ✅ expo-video API を呼び出し
          await videoViewRef.current?.stopPictureInPicture();
          // ✅ 手動で状態を更新
          setIsPip(false);
        }
      } catch (error) {
        console.error("PiP toggle error:", error);
        console.error("PiP toggle error message:", (error as Error).message);
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
            // ✅ expo-video の PiP API コールバック
            onPictureInPictureStart={() => {
              setIsPip(true);
              console.log('[PiP] Picture in Picture started');
            }}
            onPictureInPictureStop={() => {
              setIsPip(false);
              console.log('[PiP] Picture in Picture stopped');
            }}
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
