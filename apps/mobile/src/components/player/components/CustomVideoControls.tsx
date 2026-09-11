import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import type { PlayerConfig } from '../types';
import { VideoSettingsModal } from './VideoSettingsModal';
import { usePlayerSettingsStore } from '@/stores/player-settings-store';

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
  isPip,
  danmakuAnimation,
}) => {
  const { state, play, pause, seek, verifyPlayingState, getPlayerStatus } = videoPlayback;

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedPlaybackRate, setSelectedPlaybackRate] = useState(1);
  
  // ✅ 設定ストアから動的に取得
  const { settings, loadSettings } = usePlayerSettingsStore();
  const BACK_SECONDS = settings.backSeekSeconds;
  const FORWARD_SECONDS = settings.forwardSeekSeconds;
  
  // アイコン名を秒数に応じて動的に決定
  const getRewindIconName = (seconds: number): string => {
    switch (seconds) {
      case 5:
        return "rewind-5";
      case 10:
        return "rewind-10";
      case 15:
        return "rewind-15";
      case 30:
        return "rewind-30";
      default:
        return "rewind-10";
    }
  };

  const getFastForwardIconName = (seconds: number): string => {
    switch (seconds) {
      case 5:
        return "fast-forward-5";
      case 10:
        return "fast-forward-10";
      case 15:
        return "fast-forward-15";
      case 30:
        return "fast-forward-30";
      default:
        return "fast-forward-10";
    }
  };
  
  // デバウンス: 再生/停止ボタンの連続押下を防止（ms）
  const PLAY_PAUSE_DEBOUNCE_MS = 300;


  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  // デバウンス用: 最後の再生/停止ボタン操作時刻
  const lastPlayPauseTimeRef = useRef<number>(0);
  
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
      
      if (onPipToggle) {
        await onPipToggle(newPipState);
      }
      
      resetHideTimer();
    } catch (e) {
      console.error("PiP error:", e);
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
  // ✅ 改善: デバウンス + 状態確認ロジック
  const handlePlayPause = () => {
    const now = Date.now();
    
    // デバウンス: 短期間の連続クリックを防止
    if (now - lastPlayPauseTimeRef.current < PLAY_PAUSE_DEBOUNCE_MS) {
      return;
    }
    lastPlayPauseTimeRef.current = now;

    // 楽観的に状態を反転
    const nextPlaying = !state.playing;
    
    try {
      if (nextPlaying) {
        play();
      } else {
        pause();
      }
      
      // 状態が確実に反映されたか確認（非同期バリデーション）
      // 100ms後に確認して、ズレがあれば修正
      setTimeout(() => {
        const isValid = verifyPlayingState(nextPlaying);
        if (!isValid) {
          console.warn('[CustomVideoControls] Playing state verification failed, correcting...');
          // 再度コマンドを送信
          if (nextPlaying) {
            play();
          } else {
            pause();
          }
        }
      }, 100);
    } catch (error) {
      console.error('[CustomVideoControls] handlePlayPause error:', error);
      // エラー発生時は実際のプレイヤー状態を確認
      const actual = getPlayerStatus();
      if (actual !== null && actual !== state.playing) {
        console.warn('[CustomVideoControls] Recovering from error, actual state:', actual);
      }
    }
    
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

  // 設定をロード
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
            // タッチ領域を上下に12px ずつ拡大
            // hitSlop でタッチ領域を拡大（見た目は変わらない）
            hitSlop={{ top: 12, bottom: 12, left: 0, right: 0 }}
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
              {/* 戻るボタン - アイコンを秒数に応じて動的に変更 */}
              <TouchableOpacity onPress={handleBackward}>
                <Icon 
                  name={getRewindIconName(BACK_SECONDS)} 
                  size={28} 
                  color="#fff" 
                />
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

              {/* 進むボタン - アイコンを秒数に応じて動的に変更 */}
              <TouchableOpacity onPress={handleForward}>
                <Icon 
                  name={getFastForwardIconName(FORWARD_SECONDS)} 
                  size={28} 
                  color="#fff" 
                />
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
        playbackRates={playbackRates}
        selectedPlaybackRate={selectedPlaybackRate}
        onPlaybackRateChange={handlePlaybackRateChange}
      />
    </>
  );
};

export default CustomVideoControls;
