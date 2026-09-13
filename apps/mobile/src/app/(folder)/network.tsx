/**
 * ネットワーク画面
 * ✅ 接続済みドライブの一覧表示
 * ✅ ドライブ選択機能
 * ✅ connectionId の管理
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useDrives } from '@/hooks/use-drives';
import { Sidebar } from '@/components/Sidebar';
import { GoogleLogoSVG } from '@/components/GoogleButton';
import { MicrosoftLogoSVG } from '@/components/MicrosoftButton';
import { AddDriveModal } from '@/components/AddDriveModal';
import { SwipeableDriveItem } from '@/components/SwipeableDriveItem';
import { appLogger } from '@/utils/logger';

/**
 * 接続日時をフォーマット
 * connectedAt は ISO 8601 形式の文字列
 */
function formatConnectedDate(connectedAt: string | Date | undefined): string {
  if (!connectedAt) return '不明';

  try {
    // Date オブジェクトまたは ISO 8601 形式の文字列をパース
    const date = new Date(connectedAt);
    
    // 無効な日付チェック
    if (isNaN(date.getTime())) {
      appLogger.error('[formatConnectedDate] 無効な日付:', connectedAt);
      return '不明';
    }
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    appLogger.error('[formatConnectedDate] 日付フォーマット失敗:', error);
    return '不明';
  }
}

export default function NetworkScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1 bg-stone-100" edges={['top']}>
        {/* ヘッダー */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => setSidebarOpen(true)} className="w-10 h-10 justify-center items-center">
            <Text className="text-2xl">☰</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-semibold text-center">接続先</Text>
          <TouchableOpacity onPress={() => setModalOpen(true)} className="w-10 h-10 justify-center items-center">
            <Text className="text-2xl">+</Text>
          </TouchableOpacity>
        </View>

        {/* コンテンツ */}
        <ScrollView className="flex-1 px-4 py-6">
          {drives.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-xl font-semibold text-gray-900 mb-2">ドライブが接続されていません</Text>
              <Text className="text-sm text-gray-600 text-center mb-6">
                クラウドストレージを接続してご利用ください
              </Text>
              <TouchableOpacity
                onPress={() => setModalOpen(true)}
                className="bg-blue-500 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-semibold">+ ドライブを追加</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-lg font-bold text-gray-900 mb-4">接続済みドライブ</Text>

              {/* ✅ スワイプ可能なドライブ一覧 */}
              {drives.map((drive) => (
                <SwipeableDriveItem
                  key={drive.id}
                  drive={drive}
                  isSelected={selectedDrive?.id === drive.id}
                  onPress={() => handleSelectDrive(drive.id)}
                  getProviderIcon={getProviderIcon}
                  formatConnectedDate={formatConnectedDate}
                />
              ))}
            </>
          )}
        </ScrollView>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* ✅ ドライブ追加モーダル */}
        <AddDriveModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
