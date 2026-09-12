import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Sidebar } from '../components/Sidebar';

export default function SettingsScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const settingItems = [
    { label: '字幕設定', icon: '📝' },
    { label: 'オーディオ設定', icon: '🔊' },
    { label: 'ビデオ設定', icon: '🎬' },
    { label: 'コメント設定', icon: '💬' },
    { label: 'ダウンロード設定', icon: '⚙️' },
    { label: 'プライバシー', icon: '🔒' },
  ];

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
          設定
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          設定
        </Text>

        {settingItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center px-4 py-4 bg-white rounded-lg mb-3 shadow-sm"
          >
            <Text className="text-2xl mr-3">{item.icon}</Text>
            <Text className="flex-1 text-base text-gray-900">
              {item.label}
            </Text>
            <Text className="text-xl text-gray-400">›</Text>
          </TouchableOpacity>
        ))}

        <View className="mt-6" />
      </ScrollView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
