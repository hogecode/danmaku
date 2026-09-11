/**
 * ローカルファイル画面
 * デバイスのローカルファイルから動画を再生
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { appLogger } from '@/utils/logger';

export default function LocalScreen() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      appLogger.info('[LocalScreen] ユーザーがログインしていません');
      router.replace('/login');
      return;
    }

    appLogger.info('[LocalScreen] ローカルファイル画面を表示');
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  // ホーム画面に戻る
  const handleBackToHome = () => {
    appLogger.info('[LocalScreen] ホーム画面へ戻る');
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          ローカルファイル
        </Text>
        <Text className="text-base text-gray-600 mb-12 text-center">
          ローカルファイルの再生機能は、近日中に実装予定です
        </Text>

        {/* 戻るボタン */}
        <TouchableOpacity
          onPress={handleBackToHome}
          activeOpacity={0.7}
          className="w-full bg-gray-500 rounded-lg py-3 px-6"
        >
          <Text className="text-white text-lg font-semibold text-center">
            ← ホーム画面に戻る
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
