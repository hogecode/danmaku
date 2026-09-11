import { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Player } from '@/components/player';
import { useVideo } from '@/hooks/use-video';
import { appLogger } from '@/utils/logger';
import { usePlayerSettingsStore } from '@/stores/player-settings-store';
import type { PlayerConfig, Danmaku } from '@/components/player';

/**
 * ビデオプレイヤー画面
 * 
 * DPlayer を使用した動画再生＋リアルタイムコメント表示
 */
export default function PlayerScreen() {
  const video = useVideo();
  const { id, fileName, folderId, isLocalFile } = useLocalSearchParams<{ id: string; fileName?: string; folderId?: string; isLocalFile?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  
  // プレイヤー設定ストアから動的に設定を取得
  const { settings, loadSettings } = usePlayerSettingsStore();

  // 設定をロード
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ビデオを初期化
  useEffect(() => {
    if (!id) {
      appLogger.error('[PlayerScreen] Video ID not provided');
      router.back();
      return;
    }

    // ビデオプレイヤーを初期化
    const initVideo = async () => {
      try {
        appLogger.info(`[PlayerScreen] Initializing video: ${id}, isLocalFile: ${isLocalFile}`);
        await video.initializePlayer({
          videoFileId: id,
          fileName: fileName || 'Unknown',
          folderId: folderId || undefined,
          isLocalFile: isLocalFile === 'true',
        });
      } catch (error) {
        appLogger.error('[PlayerScreen] Failed to initialize video', error);
      }
    };

    initVideo();

    // NOTE: cleanup は依存配列の無限ループを防ぐため除外
    // ページを離れる時はスタック上のクリーンアップが行われる
  }, [id, fileName, folderId, isLocalFile]); // video を依存配列から除外

  const handlePlayerReady = () => {
    appLogger.info(`[PlayerScreen] Player ready for: ${id}`);
    setIsLoading(false);
  };

  const handlePlayerError = (error: string) => {
    appLogger.error(`[PlayerScreen] Player error: ${error}`);
  };

  // ✅ 設定をストアから動的に取得
  const AUTO_PLAY = settings.autoPlay;
  const SPEED_RATE = settings.playbackRate;
  const FONT_SIZE = settings.danmakuFontSize;
  const OPACITY = settings.danmakuOpacity;
  const DEFAULT_COLOR = settings.danmakuColor || '#ffffff';
  
  // プレイヤー設定を構築
  const playerConfig = useMemo((): PlayerConfig => {
    return {
      container: null,
      video: {
        url: video.config?.videoUrl || '',
        type: 'normal',
        pic: undefined,
      },
      autoplay: AUTO_PLAY,
      volume: 1,
      theme: '#E64F97',
      danmaku: {
        speedRate: SPEED_RATE,
        fontSize: FONT_SIZE,
        opacity: OPACITY,
        unlimited: false,
        maxTracks: 10,
        defaultColor: DEFAULT_COLOR,
      },
      apiBackend: {
        read: ({ success, error }) => {
          // コメント読み込み
          try {
            if (video.comments && video.comments.length > 0) {
              const danmakus: Danmaku[] = video.comments.map((comment: any) => ({
                time: parseFloat(comment.vpos) || 0, // vpos は秒単位（浮動小数点）
                type: comment.type || 'normal',
                // ✅ 色を設定しない → DanmakuDisplay の defaultColor を使用
                // 設定モーダルで色を変更したとき、リアルタイムに反映される
                // color は省略（undefined）
                author: comment.user_id || 'anonymous',
                text: comment.text || '',
              }));
              appLogger.debug(`[PlayerScreen] Loaded ${danmakus.length} danmakus`);
              success(danmakus);
            } else {
              console.log('[PlayerScreen] No comments to load');
              success([]);
            }
          } catch (err) {
            appLogger.error('[PlayerScreen] Failed to load danmakus', err);
            error('コメント読み込み失敗');
          }
        },
        send: ({ comment, success, error }) => {
          success();
        },
      },
    };
  }, [video.config?.videoUrl, video.comments, DEFAULT_COLOR, SPEED_RATE, FONT_SIZE, OPACITY, AUTO_PLAY]);

  // エラー状態
  if (video.error) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="min-h-[52px] flex-row items-center px-4 bg-neutral-900">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-base">← Back</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 text-center">{video.error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <View className="min-h-[52px] flex-row items-center px-4 bg-neutral-900">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="flex-1 ml-4 text-white text-base" numberOfLines={1}>
          {video.config?.fileName || fileName}
        </Text>
      </View>

      <View className="flex-1 bg-black">
        {video.config?.videoUrl && playerConfig.video.url ? (
          // プレイヤーコンポーネントを表示
          <Player
            config={playerConfig}
            onReady={handlePlayerReady}
            onError={handlePlayerError}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#E64F97" />
            <Text className="text-white mt-4">Loading player...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

