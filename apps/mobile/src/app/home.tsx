import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../hooks/use-auth';
import { appLogger } from '../utils/logger';
import { Sidebar } from '../components/Sidebar';

export default function HomeScreen() {
  const auth = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace('/login');
      return;
    }
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  const handleGDrivePress = () => {
    router.push('/gdrive');
  };

  const handleLocalPress = () => {
    router.push('/local');
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
          Danmaku Player
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 justify-center items-center px-6">

        <TouchableOpacity
          onPress={handleGDrivePress}
          activeOpacity={0.7}
          className="w-full  rounded-lg py-4 px-6 mb-4 shadow-md"
        >
          <Text className=" text-lg font-semibold text-center">
            📁 Google Drive
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLocalPress}
          activeOpacity={0.7}
          className="w-full bg-green-500 rounded-lg py-4 px-6 shadow-md"
        >
          <Text className=" text-lg font-semibold text-center">
            💾 ローカルファイル
          </Text>
        </TouchableOpacity>
      </View>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
