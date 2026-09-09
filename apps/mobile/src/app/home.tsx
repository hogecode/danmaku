/**
 * ホーム画面（Google Drive ファイル一覧）
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
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
      <View className="flex-1 justify-center items-center">
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
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 justify-center items-center" onPress={handleBack}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-center">Google Drive</Text>
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center"
          onPress={drive.refresh}
          disabled={drive.loading}
        >
          <Text className="text-2xl">↻</Text>
        </TouchableOpacity>
      </View>

      {drive.loading && drive.files.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : drive.files.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-base text-gray-400">ファイルがありません</Text>
        </View>
      ) : (
        <FlatList
          data={drive.files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-white my-1 mx-2 rounded-lg"
              onPress={() =>
                handleFilePress(item.id, item.mimeType, item.name)
              }
            >
              <Text className="text-2xl mr-3">
                {isVideo(item.mimeType) ? '🎬' : '📁'}
              </Text>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
                  {item.name}
                </Text>
                {isVideo(item.mimeType) && item.size && (
                  <Text className="text-xs text-gray-400 mt-1">
                    {formatFileSize(item.size)}
                  </Text>
                )}
              </View>
              <Text className="text-lg text-gray-300">›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {drive.error && (
        <View className="bg-red-50 px-4 py-3 m-2 rounded-lg">
          <Text className="text-red-900 text-xs">{drive.error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}