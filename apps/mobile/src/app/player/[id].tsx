import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideo } from '@/hooks/use-video';
import { appLogger } from '@/utils/logger';

export default function PlayerScreen() {
  const video = useVideo();
  const { id, fileName } = useLocalSearchParams<{ id: string; fileName?: string }>();
  const [isLoading, setIsLoading] = useState(true);

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
          <video
            src={video.config.videoUrl}
            controls
            style={styles.webVideo as any}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
          />
        ) : (
          <View style={styles.nativeVideoFallback}>
            <Text style={styles.nativeVideoText}>Video playback is unavailable on this platform.</Text>
          </View>
        )}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        <View style={styles.danmakuOverlay}>
          {video.visibleComments.map((comment: { no: string | number; text: string }, idx: number) => (
            <Text key={`${comment.no}-${idx}`} style={[styles.danmakuText, { top: 50 + idx * 30 }]} numberOfLines={1}>
              {comment.text}
            </Text>
          ))}
        </View>
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
  nativeVideoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeVideoText: {
    color: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danmakuOverlay: {
    ...StyleSheet.absoluteFillObject,
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