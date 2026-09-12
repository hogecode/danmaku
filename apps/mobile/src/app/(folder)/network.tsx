/**
 * ネットワーク画面
 * ✅ 接続済みドライブの一覧表示
 * ✅ ドライブ選択機能
 * ✅ connectionId の管理
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDrives } from '@/hooks/use-drives';
import { Sidebar } from '@/components/Sidebar';
import { GoogleLogoSVG } from '@/components/GoogleButton';
import { MicrosoftLogoSVG } from '@/components/MicrosoftButton';
import { appLogger } from '@/utils/logger';

export default function NetworkScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { drives, selectedDrive, selectDrive, isLoading } = useDrives();

  /**
   * ドライブを選択し、プロバイダーに応じた画面に遷移
   */
  const handleSelectDrive = (connectionId: string) => {
    const drive = drives.find((d) => d.id === connectionId);
    
    appLogger.info(
      `[NetworkScreen] Drive selected ${JSON.stringify({
        connectionId,
        provider: drive?.provider,
      })}`,
    );
    
    selectDrive(connectionId);

    // ✅ プロバイダーに応じた遷移ロジック
    if (drive?.provider === 'google') {
      appLogger.info('[NetworkScreen] Google Drive へ遷移');
      router.push('/gdrive');
    } else if (drive?.provider === 'onedrive') {
      appLogger.info('[NetworkScreen] OneDrive へ遷移');
      router.push('/onedrive');
    } else {
      // デフォルトはホーム画面
      appLogger.info('[NetworkScreen] ホーム画面へ遷移');
      router.push('/');
    }
  };

  /**
   * プロバイダーアイコンを取得
   */
  const getProviderIcon = (provider: string) => {
    return (
      <View style={{ width: 48, height: 48 }}>
        {provider === 'google' && <GoogleLogoSVG />}
        {provider === 'onedrive' && <MicrosoftLogoSVG />}
        {provider === 'dropbox' && <Text className="text-3xl">💼</Text>}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-stone-100 justify-center items-center">
        <ActivityIndicator size="large" color="#1976d2" />
        <Text className="text-gray-600 mt-4">ドライブを読み込み中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => setSidebarOpen(true)} className="w-10 h-10 justify-center items-center">
          <Text className="text-2xl">☰</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-center">接続先</Text>
        <View className="w-10" />
      </View>

      {/* コンテンツ */}
      <ScrollView className="flex-1 px-4 py-6">
        {drives.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-xl font-semibold text-gray-900 mb-2">ドライブが接続されていません</Text>
            <Text className="text-sm text-gray-600 text-center">
              設定画面からドライブを接続してください
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-lg font-bold text-gray-900 mb-4">接続済みドライブ</Text>

            {/* ✅ ドライブ一覧 */}
            {drives.map((drive) => (
              <TouchableOpacity
                key={drive.id}
                onPress={() => handleSelectDrive(drive.id)}
                className={`rounded-lg p-4 mb-3 flex-row items-center border-2 ${
                  selectedDrive?.id === drive.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* アイコン */}
                <View className="mr-3">
                  {getProviderIcon(drive.provider)}
                </View>

                {/* ドライブ情報 */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {drive.provider.toUpperCase()}
                    </Text>
                    {/* ✅ ステータスバッジ */}
                    <View
                      className={`px-2 py-1 rounded-full ${
                        drive.status === 'connected'
                          ? 'bg-green-100'
                          : drive.status === 'expired'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          drive.status === 'connected'
                            ? 'text-green-700'
                            : drive.status === 'expired'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                        }`}
                      >
                        {drive.status === 'connected'
                          ? '接続中'
                          : drive.status === 'expired'
                          ? '再認証必要'
                          : 'エラー'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-600">{drive.account}</Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    接続日時: {new Date(drive.connectedAt).toLocaleDateString('ja-JP')}
                  </Text>
                </View>

                {/* チェックマーク */}
                {selectedDrive?.id === drive.id && (
                  <Text className="text-2xl text-blue-500 ml-2">✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* ✅ 選択中のドライブ情報 */}
            {selectedDrive && (
              <View className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Text className="text-sm font-semibold text-blue-900 mb-2">
                  現在選択中:
                </Text>
                <Text className="text-base text-blue-800">
                  {selectedDrive.account} ({selectedDrive.provider})
                </Text>
                <Text className="text-xs text-blue-600 mt-2">
                  ID: {selectedDrive.id}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </SafeAreaView>
  );
}
