import { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Player } from '@/components/player';
import { useVideo } from '@/hooks/use-video';
import { appLogger } from '@/utils/logger';
import type { PlayerConfig, Danmaku } from '@/components/player';

/**
 * ビデオプレイヤー画面
 * 
 * DPlayer を使用した動画再生＋リアルタイムコメント表示
 */
export default function PlayerScreen() {
  const video = useVideo();
  const { id, fileName, folderId } = useLocalSearchParams<{ id: string; fileName?: string; folderId?: string }>();
  const [isLoading, setIsLoading] = useState(true);

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
        appLogger.info(`[PlayerScreen] Initializing video: ${id}`);
        await video.initializePlayer({
          videoFileId: id,
          fileName: fileName || 'Unknown',
          folderId: folderId || undefined,
        });
      } catch (error) {
        appLogger.error('[PlayerScreen] Failed to initialize video', error);
      }
    };

    initVideo();

    // NOTE: cleanup は依存配列の無限ループを防ぐため除外
    // ページを離れる時はスタック上のクリーンアップが行われる
  }, [id, fileName, folderId]); // video を依存配列から除外

  const handlePlayerReady = () => {
    appLogger.info(`[PlayerScreen] Player ready for: ${id}`);
    setIsLoading(false);
  };

  const handlePlayerError = (error: string) => {
    appLogger.error(`[PlayerScreen] Player error: ${error}`);
  };

  const handleDanmakuSend = (danmaku: Danmaku) => {
  };

  // プレイヤー設定を構築
  const playerConfig = useMemo((): PlayerConfig => {
    return {
      container: null,
      video: {
        url: video.config?.videoUrl || '',
        type: 'normal',
        pic: undefined,
      },
      autoplay: false,
      volume: 1,
      theme: '#E64F97',
      danmaku: {
        speedRate: 1,
        fontSize: 16,
        opacity: 0.8,
        unlimited: false,
      },
      apiBackend: {
        read: ({ success, error }) => {
          // コメント読み込み
          try {
            if (video.comments && video.comments.length > 0) {
              console.log('[PlayerScreen] Converting comments:', {
                count: video.comments.length,
                sample: video.comments[0],
              });
              
              const danmakus: Danmaku[] = video.comments.map((comment: any) => ({
                time: parseFloat(comment.vpos) || 0, // vpos は秒単位（浮動小数点）
                type: 'normal' as const,
                color: '#ffffff',
                author: comment.user_id || 'anonymous',
                text: comment.text || '',
              }));
              
              console.log('[PlayerScreen] Converted danmakus:', {
                count: danmakus.length,
                sample: danmakus[0],
              });
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
  }, [video.config?.videoUrl, video.comments]);

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
          <Player
            config={playerConfig}
            onReady={handlePlayerReady}
            onError={handlePlayerError}
            onDanmakuSend={handleDanmakuSend}
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

