/**
 * ホーム画面（Google Drive ファイル一覧）
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { useDrive } from '@/hooks/use-drive';
import { FOLDER_MIME_TYPE, VIDEO_MIME_TYPES } from '@/utils/constants';
import { appLogger } from '@/utils/logger';

export default function HomeScreen() {
  const auth = useAuth();
  const drive = useDrive();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      appLogger.info('[HomeScreen] ユーザーがログインしていません');
      router.replace('/login');
      return;
    }

    appLogger.info('[HomeScreen] Google Drive ファイル一覧を読み込み');
    drive.loadFolder();
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  const isFolder = (mimeType: string) => mimeType === FOLDER_MIME_TYPE;
  const isVideo = (mimeType: string) =>
    VIDEO_MIME_TYPES.some((vmt) => mimeType.includes(vmt));

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleFilePress = (fileId: string, mimeType: string, name: string) => {
    if (isVideo(mimeType)) {
      router.push(`/player/${fileId}?fileName=${encodeURIComponent(name)}`);
    } else if (isFolder(mimeType)) {
      drive.navigateToFolder(fileId);
    }
  };

  const handleBack = () => {
    if (drive.folderStack.length > 1) {
      drive.goBack();
    } else {
      auth.logout();
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Google Drive</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={drive.refresh}
          disabled={drive.loading}
        >
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {drive.loading && drive.files.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : drive.files.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>ファイルがありません</Text>
        </View>
      ) : (
        <FlatList
          data={drive.files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fileItem}
              onPress={() =>
                handleFilePress(item.id, item.mimeType, item.name)
              }
            >
              <Text style={styles.fileIcon}>
                {isVideo(item.mimeType) ? '🎬' : '📁'}
              </Text>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={2}>
                  {item.name}
                </Text>
                {isVideo(item.mimeType) && item.size && (
                  <Text style={styles.fileSize}>
                    {formatFileSize(item.size)}
                  </Text>
                )}
              </View>
              <Text style={styles.fileArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {drive.error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{drive.error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    paddingVertical: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  fileArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
  },
});