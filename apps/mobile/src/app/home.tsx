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
