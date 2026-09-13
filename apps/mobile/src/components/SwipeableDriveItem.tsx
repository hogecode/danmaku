/**
 * スワイプ可能なドライブアイテム
 * ✅ 左スワイプで「接続解除」ボタン表示
 * ✅ smooth アニメーション
 * ✅ OpenAPI クライアント統合
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { DriveConnectionDto } from '@/generated/models';
import { appLogger } from '@/utils/logger';
import { DriveConnectionApi } from '@/generated';
import { createApiConfiguration } from '@/services/api-config';
import { useDrivesStore } from '@/stores/drives-store';

interface SwipeableDriveItemProps {
  drive: DriveConnectionDto;
  isSelected: boolean;
  onPress: () => void;
  getProviderIcon: (provider: string) => React.ReactNode;
  formatConnectedDate: (date: string | Date | undefined) => string;
}

export function SwipeableDriveItem({
  drive,
  isSelected,
  onPress,
  getProviderIcon,
  formatConnectedDate,
}: SwipeableDriveItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const { removeDrive } = useDrivesStore();

  /**
   * 接続解除API呼び出し
   */
  const handleDisconnectDrive = async () => {
    Alert.alert(
      '接続を解除しますか？',
      `${drive.provider.toUpperCase()} (${drive.account}) の接続を解除します。`,
      [
        { text: 'キャンセル', onPress: () => {}, style: 'cancel' },
        {
          text: '接続解除',
          onPress: async () => {
            try {
              setIsDisconnecting(true);
              appLogger.info(
                `[SwipeableDriveItem] Disconnecting drive: id=${drive.id}`,
              );

              // ✅ OpenAPI クライアント（自動生成）を使用して接続解除
              const config = createApiConfiguration();
              const driveConnectionApi = new DriveConnectionApi(config);
              await driveConnectionApi.driveConnectionControllerDelete({ connectionId: drive.id });

              appLogger.info(
                `[SwipeableDriveItem] ✅ Drive disconnected: id=${drive.id}`,
              );

              // ✅ ストアから削除
              removeDrive(drive.id);

              // ✅ スワイプを閉じる
              swipeableRef.current?.close();

              Alert.alert('成功', '接続を解除しました。');
            } catch (error) {
              appLogger.error(
                `[SwipeableDriveItem] Failed to disconnect drive: id=${drive.id}`,
                error,
              );
              Alert.alert('エラー', '接続解除に失敗しました。');
            } finally {
              setIsDisconnecting(false);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  /**
   * 右側スワイプアクション（接続解除ボタン）
   * ✅ dragX をそのまま使用（react-native-reanimated v4対応）
   */
  const renderRightActions = () => (
    <View
      style={{
        width: 80,
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <TouchableOpacity
        onPress={handleDisconnectDrive}
        disabled={isDisconnecting}
        style={{
          flex: 1,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isDisconnecting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>接続</Text>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>解除</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      onSwipeableWillOpen={() => {
        appLogger.debug(`[SwipeableDriveItem] Swiping drive: id=${drive.id}`);
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        className={`rounded-lg p-4 mb-3 flex-row items-center border-2 ${
          isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
        }`}
      >
        {/* アイコン */}
        <View className="mr-3">{getProviderIcon(drive.provider)}</View>

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
            接続日時: {formatConnectedDate(drive.connectedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
