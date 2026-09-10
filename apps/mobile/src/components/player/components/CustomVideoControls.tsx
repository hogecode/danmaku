import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import type { PlayerConfig } from '../types';
import { VideoSettingsModal } from './VideoSettingsModal';

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface CustomVideoControlsProps {
  videoPlayback: any;
  config: PlayerConfig;
  onSettingsChange?: (settings: any) => void;
  onDanmakuOpacityChange?: (opacity: number) => void;
  onFullscreenToggle?: (enterFullscreen: boolean) => Promise<void>;
  onPipToggle?: (enterPip: boolean) => Promise<void>;
  isFullscreen?: boolean;
  isPip?: boolean;
  danmakuAnimation?: any;  // useDanmakuAnimation から外部で注入
}

export const CustomVideoControls: React.FC<CustomVideoControlsProps> = ({
  videoPlayback,
  config,
  onSettingsChange,
  onDanmakuOpacityChange,
  onFullscreenToggle,
  onPipToggle,
  isFullscreen,
  isPip: externalIsPip,
  danmakuAnimation,
}) => {
  const { state, play, pause, seek } = videoPlayback;

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedPlaybackRate, setSelectedPlaybackRate] = useState(1);
  const [internalIsPip, setInternalIsPip] = useState(false);
  

  // TODO: 設定で変更できるようにする
  const BACK_SECONDS = 10;
  const FORWARD_SECONDS = 10;

  // 外部から提供された isPip を使用、なければ内部状態を使用
  const isPip = externalIsPip ?? internalIsPip;

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleFullscreenPress = async () => {
    try {
      const newFullscreenState = !isFullscreen;
      
      if (onFullscreenToggle) {
        await onFullscreenToggle(newFullscreenState);
      }
      
      resetHideTimer();
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  };

  const handlePipPress = async () => {
    try {
      const newPipState = !isPip;
      // 内部状態を更新（外部から提供されていない場合のみ）
      if (externalIsPip === undefined) {
        setInternalIsPip(newPipState);
      }
      
      if (onPipToggle) {
        await onPipToggle(newPipState);
      }
      
      resetHideTimer();
    } catch (e) {
      console.error("PiP error:", e);
      // エラー時は状態をロールバック
      if (externalIsPip === undefined) {
        setInternalIsPip(!internalIsPip);
      }
    }
  };

  // コントロール非表示タイマーをリセット
  const resetHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    // タイマーをリセットするたびに既存のタイマーをクリア
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, 3000);
  };

  // ビデオタップ時の処理（コントロール表示のリセット）
  const handleVideoTap = () => resetHideTimer();

  // 10秒戻るボタンの処理
  const handleBackward = () => {
    seek(Math.max(0, state.currentTime - BACK_SECONDS));
    resetHideTimer();
  };

  // 再生/一時停止ボタンの処理
  const handlePlayPause = () => {
    state.playing ? pause() : play();
    resetHideTimer();
  };

  // 10秒進むボタンの処理
  const handleForward = () => {
    seek(Math.min(state.duration, state.currentTime + FORWARD_SECONDS));
    resetHideTimer();
  };

  // 再生速度変更の処理
  const handlePlaybackRateChange = (rate: number) => {
    setSelectedPlaybackRate(rate);
    videoPlayback.setPlaybackRate(rate);
    resetHideTimer();
  };
  
  // 設定モーダルを閉じる処理
  const handleSettingsClose = () => {
    setSettingsModalVisible(false);
    resetHideTimer();
  };

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [],
  );
  
  useEffect(() => {
    resetHideTimer();
  }, []);

  return (
    <>
      {/* ビデオタップエリア */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: screenWidth,
          height: screenHeight * 0.56,
          zIndex: 10,
        }}
        activeOpacity={1}
        onPress={handleVideoTap}
      />
      {/* コントローラーバー（下部） */}
      {controlsVisible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            opacity: fadeAnim,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          {/* プログレスバー（クリック可能） */}
          <TouchableOpacity
            onPress={(event) => {
              const { locationX } = event.nativeEvent;
              const progressBarWidth = screenWidth - 24; // paddingHorizontal: 12 * 2
              const percentage = locationX / progressBarWidth;
              const newTime = Math.max(0, Math.min(state.duration, percentage * state.duration));
              seek(newTime);
              resetHideTimer();
            }}
            activeOpacity={0.8}
            style={{
              height: 4,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: 2,
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            {/* バッファ済み部分（グレー） */}
            <View
              style={{
                height: "100%",
                width: `${state.duration > 0 ? (state.buffering / 100) * 100 : 0}%`,
                backgroundColor: "rgba(255, 255, 255, 0.4)",
              }}
            />
            
            {/* 再生済み部分（ピンク） */}
            <View
              style={{
                position: "absolute",
                height: "100%",
                width: `${state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0}%`,
                backgroundColor: "#E64F97",
              }}
            />
          </TouchableOpacity>

          {/* コントローラー操作部分 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* 時間表示（左） */}
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
                minWidth: 80,
              }}
            >
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </Text>

            {/* 中央操作ボタングループ */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                flex: 1,
                justifyContent: "center",
              }}
            >
              {/* 10秒戻るボタン 
              TODO: アイコンをカスタマイズできるようにする
              */}
              <TouchableOpacity onPress={handleBackward}>
                <Icon name="rewind-10" size={28} color="#fff" />
              </TouchableOpacity>

              {/* 再生/一時停止ボタン */}
              <TouchableOpacity
                onPress={handlePlayPause}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#E64F97",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon
                  name={state.playing ? "pause" : "play"}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* 10秒進むボタン 
              TODO: アイコンをカスタマイズできるようにする
              */}
              <TouchableOpacity onPress={handleForward}>
                <Icon name="fast-forward-10" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* 右側機能ボタングループ */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                minWidth: 140,
                justifyContent: "flex-end",
              }}
            >
              {/* コメント表示/非表示ボタン
              　TODO: アイコン見直す
              */}
              {danmakuAnimation && (
                <TouchableOpacity
                  onPress={() => {
                    danmakuAnimation.toggle();
                    resetHideTimer();
                  }}
                >
                  <Icon 
                    name={danmakuAnimation.visible ? "eye" : "eye-off"} 
                    size={20} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              )}

              {/* 設定ボタン */}
              <TouchableOpacity
                onPress={() => {
                  setSettingsModalVisible(true);
                  if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                }}
              >
                <Icon name="cog" size={20} color="#fff" />
              </TouchableOpacity>

              {/* Picture in Picture（小窓表示）ボタン */}
              <TouchableOpacity onPress={handlePipPress}>
                <Icon name={isPip ? "image-multiple-outline" : "image-multiple"} size={20} color="#fff" />
              </TouchableOpacity>

              {/* フルスクリーンボタン */}
              <TouchableOpacity onPress={handleFullscreenPress}>
                <Icon name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
      <VideoSettingsModal
        visible={settingsModalVisible}
        onClose={handleSettingsClose}
        config={config}
        onSettingsChange={onSettingsChange}
        playbackRates={playbackRates}
        selectedPlaybackRate={selectedPlaybackRate}
        onPlaybackRateChange={handlePlaybackRateChange}
        onDanmakuOpacityChange={onDanmakuOpacityChange}
      />
    </>
  );
};

export default CustomVideoControls;
