import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '../hooks/use-auth';
import { appLogger } from '../utils/logger';

type NavPath = '/local' | '/network' | '/playlist' | '/download' | '/settings';

interface NavItem {
  label: string;
  icon: string;
  path: NavPath;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'ローカルファイル', icon: '💾', path: '/local' },
  { label: 'ネットワーク', icon: '🌐', path: '/network' },
  { label: 'プレイリスト', icon: '📋', path: '/playlist' },
  { label: 'ダウンロード', icon: '⬇️', path: '/download' },
  { label: '設定', icon: '⚙️', path: '/settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const auth = useAuth();

  const handleNavPress = (path: NavPath) => {
    appLogger.info(`[Sidebar] ${path} へ遷移`);
    router.replace(path as any);
    onClose();
  };

  const handleLogout = () => {
    appLogger.info('[Sidebar] ログアウト');
    // ユーザー認証をクリア
    auth.logout();
    router.replace('/login');
  };

  if (!isOpen) return null;

  return (
    <View className="absolute inset-0 flex-row z-50">
      {/* サイドバー */}
      <View style={{width: 240, backgroundColor: 'white'}}>
        <ScrollView className="flex-1">
          {/* ヘッダー */}
          <View className="px-4 py-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              Danmaku
            </Text>

            {/* ユーザープロフィール */}
            {auth.user && (
              <View className="mt-4 flex-row items-center">
                {/* プロフィール画像 */}
                {auth.user.pictureUrl ? (
                  <Image
                    source={{ uri: auth.user.pictureUrl }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#E5E7EB',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text className="text-xl">{auth.user.name?.[0] || 'U'}</Text>
                  </View>
                )}

                {/* ユーザー情報 */}
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-gray-900">
                    {auth.user.name || 'ユーザー'}
                  </Text>
                  <Text
                    className="text-xs text-gray-500 mt-1"
                    numberOfLines={1}
                  >
                    {auth.user.email}
                  </Text>
                </View>
              </View>
            )}

            {!auth.user && (
              <Text className="text-xs text-gray-500 mt-1">
                ユーザー
              </Text>
            )}
          </View>

          {/* ナビゲーション項目 */}
          <View className="py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => handleNavPress(item.path)}
                  className={`flex-row items-center px-4 py-3 ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <Text className="text-xl mr-3">{item.icon}</Text>
                  <Text
                    className={`flex-1 text-base ${
                      isActive
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* フッター */}
        <View className="border-t border-gray-200 px-4 py-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-lg py-3 px-4"
          >
            <Text className="text-red-600 font-semibold text-center">
              ログアウト
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* オーバーレイ */}
      <TouchableOpacity
        className="flex-1 bg-black/50"
        onPress={onClose}
        activeOpacity={1}
      />
    </View>
  );
};
