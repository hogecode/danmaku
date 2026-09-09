import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideo } from '@/hooks/use-video';
import { appLogger } from '@/utils/logger';
import { WebView } from 'react-native-webview';

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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </SafeAreaView>
    );
  }

  if (video.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{video.error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.config.fileName}
        </Text>
      </View>

      <View style={styles.playerContainer}>
        {Platform.OS === 'web' ? (
          // Web版: HTML5 video
          <video
            src={video.config.videoUrl}
            controls
            style={styles.webVideo as any}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
          />
        ) : (
          // モバイル版: WebView + HTML5 Video
          <>
            <WebView
              originWhitelist={['*']}
              source={{ html: webviewHtml }}
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
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {/* 弾幕オーバーレイ（Web のみ） */}
        {Platform.OS === 'web' && (
          <View style={styles.danmakuOverlay}>
            {video.visibleComments.map((comment: { no: string | number; text: string }, idx: number) => (
              <Text key={`${comment.no}-${idx}`} style={[styles.danmakuText, { top: 50 + idx * 30 }]} numberOfLines={1}>
                {comment.text}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>{video.currentTime.toFixed(1)}s</Text>
        <Text style={styles.commentCountText}>{video.visibleComments.length} comments</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#181818',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  webVideo: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danmakuOverlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  danmakuText: {
    position: 'absolute',
    left: 8,
    right: 8,
    color: '#fff',
    fontSize: 18,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#181818',
  },
  infoText: {
    color: '#fff',
  },
  commentCountText: {
    color: '#aaa',
  },
});