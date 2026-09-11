/**
 * ホーム画面
 * Google Drive と ローカルファイルの選択画面
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { appLogger } from '@/utils/logger';

export default function HomeScreen() {
  const auth = useAuth();

  useEffect(() => {
    // 認証状態をチェック
    if (!auth.isAuthenticated) {
      appLogger.info('[HomeScreen] ユーザーがログインしていません');
      router.replace('/login');
      return;
    }
    
    appLogger.info('[HomeScreen] ホーム画面を表示');
  }, [auth.isAuthenticated]);

  // 認証中の場合はローディング表示
  if (!auth.isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  // Google Drive へ遷移
  const handleGDrivePress = () => {
    appLogger.info('[HomeScreen] Google Drive 画面へ遷移');
    router.push('/gdrive');
  };

  // ローカルファイル へ遷移
  const handleLocalPress = () => {
    appLogger.info('[HomeScreen] ローカルファイル画面へ遷移');
    router.push('/local');
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <View className="flex-1 justify-center items-center px-6">
        {/* タイトル */}
        <Text className="text-4xl font-bold text-gray-900 mb-2">
          Danmaku Player
        </Text>

        {/* Google Drive ボタン */}
        <TouchableOpacity
          onPress={handleGDrivePress}
          activeOpacity={0.7}
          className="py-4 px-6 shadow-md"
        >
          <Text className=" text-lg font-semibold text-center">
            📁 Google Drive
          </Text>
        </TouchableOpacity>

        {/* ローカルファイル ボタン */}
        <TouchableOpacity
          onPress={handleLocalPress}
          activeOpacity={0.7}
          className="py-4 px-6 shadow-md"
        >
          <Text className=" text-lg font-semibold text-center">
            💾 ローカルファイル
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
