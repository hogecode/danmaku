import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/hooks/use-auth';
import { FileUtility } from '@/utils/FileUtility';
import { appLogger } from '@/utils/logger';
import { Sidebar } from '@/components/Sidebar';

interface LocalFile {
  id: string;
  name: string;
  uri: string;
  size?: number;
}

export default function LocalScreen() {
  const auth = useAuth();
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenFolder = async () => {
    try {
      setLoading(true);
      setError(null);
      appLogger.info('[LocalScreen] フォルダピッカーを開く');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: false, // キャッシュディレクトリにコピーしない
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const assetName = asset.name || '';
        appLogger.info(`[LocalScreen] アイテム選択: ${uri}`);

        try {
          // 選択されたアイテムがディレクトリかファイルかを判定
          const item = new File(uri);
          const isDirectory = await item.isDirectory?.() ?? false;
          
          appLogger.info(`[LocalScreen] ディレクトリ判定: ${isDirectory}`);

          let filesWithInfo: LocalFile[] = [];

          if (isDirectory) {
            // ディレクトリの場合：内部のファイルを列挙
            appLogger.info('[LocalScreen] ディレクトリモード');
            const directory = new Directory(uri);
            const fileList = await directory.listAsync();
            appLogger.info(`[LocalScreen] ファイル数: ${fileList.length}`);

            for (let i = 0; i < fileList.length; i++) {
              const file = fileList[i];
              try {
                const fileName = file.name || '';
                const mimeType = FileUtility.getMimeType(fileName);
                
                if (FileUtility.isVideo(mimeType)) {
                  let size: number | undefined;
                  try {
                    const fileSize = await file.getSize?.();
                    if (fileSize) {
                      size = fileSize;
                    }
                  } catch (e) {
                    appLogger.warning(`[LocalScreen] ファイルサイズ取得失敗: ${fileName}`);
                  }

                  filesWithInfo.push({
                    id: `${i}`,
                    name: fileName,
                    uri: file.uri,
                    size,
                  });
                }
              } catch (e) {
                appLogger.warning(`[LocalScreen] ファイルスキップ`, e);
              }
            }
          } else {
            // ファイルの場合：そのファイルをそのまま使用
            appLogger.info('[LocalScreen] ファイルモード');
            const mimeType = FileUtility.getMimeType(assetName);
            
            if (FileUtility.isVideo(mimeType)) {
              let size: number | undefined;
              try {
                const fileSize = await item.getSize?.();
                if (fileSize) {
                  size = fileSize;
                }
              } catch (e) {
                appLogger.warning('[LocalScreen] ファイルサイズ取得失敗');
              }

              filesWithInfo.push({
                id: '0',
                name: assetName,
                uri: uri,
                size,
              });
            } else {
              setError('ビデオファイルを選択してください');
            }
          }

          setFiles(filesWithInfo);
          setSelected(true);

          if (filesWithInfo.length === 0 && isDirectory) {
            setError('このフォルダにはビデオファイルがありません');
          }
        } catch (e) {
          appLogger.error('[LocalScreen] ファイル処理失敗', e);
          setError('ファイルの処理に失敗しました');
        }
      }
    } catch (err) {
      appLogger.error('[LocalScreen] フォルダピッカーエラー', err);
      setError('フォルダを開けません');
    } finally {
      setLoading(false);
    }
  };

  const handleFilePress = (file: LocalFile) => {
    router.push(
      `/player/${encodeURIComponent(file.uri)}?fileName=${encodeURIComponent(
        file.name
      )}&isLocalFile=true`
    );
  };

  const handleBack = () => {
    setFiles([]);
    setSelected(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          className="w-10 h-10 justify-center items-center"
        >
          <Text className="text-2xl">☰</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-center">
          ローカルファイル
        </Text>
        <TouchableOpacity
          className="w-10 h-10 justify-center items-center"
          onPress={handleOpenFolder}
          disabled={loading}
        >
          <Text className="text-2xl">📂</Text>
        </TouchableOpacity>
      </View>

      {!selected ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-2xl font-bold text-gray-900 mb-8">
            ローカルファイル
          </Text>
          <TouchableOpacity
            onPress={handleOpenFolder}
            disabled={loading}
            className="w-full bg-blue-500 rounded-lg py-4 px-6"
          >
            <Text className="text-white text-lg font-semibold text-center">
              {loading ? '読み込み中...' : 'フォルダを開く'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : files.length > 0 ? (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-white my-1 mx-2 rounded-lg"
              onPress={() => handleFilePress(item)}
            >
              <Text className="text-2xl mr-3">🎬</Text>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
                  {item.name}
                </Text>
                {item.size && (
                  <Text className="text-xs text-gray-400 mt-1">
                    {FileUtility.formatFileSize(item.size)}
                  </Text>
                )}
              </View>
              <Text className="text-lg text-gray-300">›</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 mb-6">
            {error || 'ビデオがありません'}
          </Text>
          <TouchableOpacity
            onPress={handleOpenFolder}
            className="bg-gray-500 rounded-lg py-3 px-6"
          >
            <Text className="text-white font-semibold">別のフォルダ</Text>
          </TouchableOpacity>
        </View>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}