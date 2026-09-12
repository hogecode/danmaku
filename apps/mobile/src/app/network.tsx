import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Sidebar } from '../components/Sidebar';

export default function NetworkScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          ネットワーク
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-4xl mb-4">🌐</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          ネットワーク
        </Text>
        <Text className="text-gray-600 text-center">
          ネットワークドライブや共有フォルダから動画を再生します
        </Text>
      </View>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
