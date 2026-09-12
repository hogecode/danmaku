import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDriveAuth } from '@/hooks/use-drive-auth';
import { Sidebar } from '@/components/Sidebar';
import { appLogger } from '@/utils/logger';
import type { DriveType, DriveOption } from '@/types/drive';

const DRIVE_OPTIONS: DriveOption[] = [
  { type: 'gdrive', name: 'Google Drive', icon: '📁', description: 'Google Drive', available: true },
  { type: 'onedrive', name: 'OneDrive', icon: '☁️', description: 'OneDrive', available: false },
];

export default function NetworkScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState<DriveType | null>(null);
  const driveAuth = useDriveAuth();

  const handleSelectDrive = async (driveType: DriveType) => {
    try {
      setLoadingDrive(driveType);
      appLogger.info(`[NetworkScreen] ${driveType} 選択`);
      
      const routePath = driveType === 'gdrive' ? '/gdrive' : '/onedrive';
      
      if (driveAuth.isAuthenticated(driveType)) {
        router.push(routePath);
        setLoadingDrive(null);
        return;
      }
      
      driveAuth.loginDrive(driveType);
      router.push(routePath);
    } catch (e) {
      appLogger.error(`[NetworkScreen] エラー`, e);
      driveAuth.setSessionError(driveType, (e as Error)?.message || 'エラー');
    } finally {
      setLoadingDrive(null);
    }
  };

  const handleSwitchDrive = (driveType: DriveType) => {
    driveAuth.setCurrentDriveType(driveType);
    const routePath = driveType === 'gdrive' ? '/gdrive' : '/onedrive';
    router.push(routePath);
  };

  const handleDisconnect = (driveType: DriveType) => {
    driveAuth.logoutDriveAuth(driveType);
  };

  const authenticatedDrives = driveAuth.authenticatedDrives;

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => setSidebarOpen(true)} className="w-10 h-10 justify-center items-center">
          <Text className="text-2xl">☰</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-center">ネットワーク</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {authenticatedDrives.length > 0 && (
          <>
            <Text className="text-lg font-bold text-gray-900 mb-4">接続済み</Text>
            {authenticatedDrives.map((driveType) => {
              const option = DRIVE_OPTIONS.find((o) => o.type === driveType);
              const session = driveAuth.sessions[driveType];
              return (
                <View key={driveType} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-3xl mr-3">{option?.icon}</Text>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900">{option?.name}</Text>
                        {session?.user && <Text className="text-xs text-gray-500 mt-1">{session.user.name}</Text>}
                      </View>
                    </View>
                    <View className="w-2 h-2 rounded-full bg-green-500" />
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleSwitchDrive(driveType)} className="flex-1 bg-blue-500 rounded-lg py-2">
                      <Text className="text-white font-semibold text-center text-sm">開く</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDisconnect(driveType)} className="flex-1 bg-red-100 rounded-lg py-2">
                      <Text className="text-red-600 font-semibold text-center text-sm">切断</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            <View className="my-4 h-px bg-gray-200" />
          </>
        )}

        <Text className="text-lg font-bold text-gray-900 mb-4">{authenticatedDrives.length > 0 ? '他のドライブ' : 'ドライブ'}</Text>

        {DRIVE_OPTIONS.filter((o) => !authenticatedDrives.includes(o.type)).map((option) => (
          <TouchableOpacity
            key={option.type}
            onPress={() => handleSelectDrive(option.type)}
            disabled={loadingDrive !== null || !option.available}
            className={`rounded-lg p-4 mb-3 flex-row items-center ${option.available ? 'bg-white shadow-sm' : 'bg-gray-100 opacity-50'}`}
          >
            <Text className="text-3xl mr-3">{option.icon}</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{option.name}</Text>
              <Text className="text-xs text-gray-500 mt-1">{option.description}</Text>
            </View>
            {loadingDrive === option.type ? <ActivityIndicator size="small" color="#1976d2" /> : <Text className="text-lg text-gray-300">›</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
