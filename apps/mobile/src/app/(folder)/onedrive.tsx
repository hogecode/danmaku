/**
 * OneDrive ファイル一覧画面
 */

import React, { useEffect, useState } from 'react';
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
import { appLogger } from '@/utils/logger';
import { FileUtility } from '@/utils/FileUtility';
import { Sidebar } from '@/components/Sidebar';

export default function OneDriveScreen() {
  const auth = useAuth();
  const drive = useDrive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      appLogger.info('[OneDriveScreen] ユーザーがログインしていません');
      router.replace('/login');
      return;
    }

    appLogger.info('[OneDriveScreen] OneDrive ファイル一覧を読み込み');
    drive.loadFolder();
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0078D4" />
      </View>
    );
  }

  // ファイルをタップしたときの処理
  const handleFilePress = (fileId: string, mimeType: string, name: string) => {
    if (FileUtility.isVideo(mimeType)) {
      const currentFolderId = drive.folderStack[drive.folderStack.length - 1];
      router.push(`/player/${fileId}?fileName=${encodeURIComponent(name)}&folderId=${currentFolderId}`);
    } else if (FileUtility.isFolder(mimeType)) {
      drive.navigateToFolder(fileId);
    }
  };

  // 戻るボタンを押したときの処理
  const handleBack = () => {
    if (drive.folderStack.length > 1) {
      drive.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={["top"]}>
      {/* ヘッダー
  　　    ←　OneDrive　↻ 
      */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          className="w-10 h-10 justify-center items-center"
        >
          <Text className="text-2xl">☰</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleBack()}
          className="w-10 h-10 justify-center items-center"
        >
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-center">
          OneDrive
        </Text>
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
          <ActivityIndicator size="large" color="#0078D4" />
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
              onPress={() => handleFilePress(item.id, item.mimeType, item.name)}
            >
              <Text className="text-2xl mr-3">
                {FileUtility.isVideo(item.mimeType) ? "🎬" : "📁"}
              </Text>
              {/* アイコンを表示するようにする */}
              <View className="flex-1">
                <Text
                  className="text-sm font-medium text-gray-900"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                {FileUtility.isVideo(item.mimeType) && item.size && (
                  <Text className="text-xs text-gray-400 mt-1">
                    {FileUtility.formatFileSize(item.size)}
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

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
