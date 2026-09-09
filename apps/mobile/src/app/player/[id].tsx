import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useVideo } from '@/hooks/use-video';
import { appLogger } from '@/utils/logger';

export default function PlayerScreen() {
  const video = useVideo();
  const { id, fileName } = useLocalSearchParams<{ id: string; fileName?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

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
        });
      } catch (error) {
        appLogger.error('[PlayerScreen] Failed to initialize video', error);
      }
    };

    initVideo();

    // NOTE: cleanup は依存配列の無限ループを防ぐため除外
    // ページを離れる時はスタック上のクリーンアップが行われる
  }, [id, fileName]); // video を依存配列から除外

  // WebView HTML を生成（シンプルな HTML5 video 使用）
  const webviewHtml = video.config?.videoUrl ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 100%; height: 100vh; background: #000; display: flex; align-items: center; justify-content: center; }
        video { max-width: 100%; max-height: 100%; }
      </style>
    </head>
    <body>
      <video 
        controls 
        style="width: 100%; height: auto;"
        onloadstart="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loadstart'}))"
        oncanplay="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'canplay'}))"
        onerror="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', message: this.error?.message || 'Unknown error'}))"
      >
        <source src="${video.config.videoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <script>
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'loaded'
        }));
      <\/script>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .loading { color: #fff; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="loading">Loading video...</div>
    </body>
    </html>
  `;

  useEffect(() => {
    if (!id) {
      appLogger.error('[PlayerScreen] Video ID missing');
      router.back();
      return;
    }
    appLogger.info(`[PlayerScreen] Initializing player: ${id}`);
    video.initializePlayer({
      videoFileId: id,
      folderId: '',
      fileName: fileName ? decodeURIComponent(fileName) : 'Video',
      videoUrl: '',
    });
  }, [id]);

  if (video.loading || !video.config) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="min-h-[52px] flex-row items-center px-4 bg-neutral-900">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-white text-base">← Back</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </SafeAreaView>
    );
  }

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
          {video.config.fileName}
        </Text>
      </View>

      <View className="flex-1 justify-center bg-black">
        {Platform.OS === 'web' ? (
          // Web版: HTML5 video
          <video
            src={video.config.videoUrl}
            controls
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
          />
        ) : (
          // モバイル版: WebView + HTML5 Video
          <>
            <WebView
              originWhitelist={['*']}
              source={{ html: webviewHtml }}
              className="w-full bg-black"
              style={{
                width: screenWidth,
                height: screenWidth * (9 / 16),
                backgroundColor: '#000',
              }}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onError={(error) => {
                appLogger.error('[PlayerScreen] WebView error', error);
              }}
              onMessage={(event) => {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'loaded') {
                  appLogger.info('[PlayerScreen] HTML5 Video loaded');
                } else if (data.type === 'error') {
                  appLogger.error('[PlayerScreen] Video error', data.message);
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
            />
          </>
        )}

        {/* ローディングインジケーター */}
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* 弾幕オーバーレイ（Web のみ） */}
        {Platform.OS === 'web' && (
          <View className="absolute inset-0 pointer-events-none">
            {video.visibleComments.map((comment: { no: string | number; text: string }, idx: number) => (
              <Text 
                key={`${comment.no}-${idx}`} 
                className="absolute left-2 right-2 text-white text-lg" 
                style={{ top: 50 + idx * 30, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}
                numberOfLines={1}
              >
                {comment.text}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View className="flex-row justify-between items-center px-4 py-2 bg-neutral-900">
        <Text className="text-white">{video.currentTime.toFixed(1)}s</Text>
        <Text className="text-white">{video.visibleComments.length} comments</Text>
      </View>
    </SafeAreaView>
  );
}
