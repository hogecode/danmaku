/**
 * ドライブ追加モーダル
 * ✅ Google Drive / Microsoft OneDrive 選択
 * ✅ OAuth認証フロー
 * ✅ Deep Link で認証完了を受け取る
 * ✅ Zustand ストアに新しいドライブを保存
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { GoogleButton } from './GoogleButton';
import { MicrosoftButton } from './MicrosoftButton';
import { driveConnectionService } from '@/services/drive-connection-service';
import { useDrivesStore } from '@/stores/drives-store';
import { appLogger } from '@/utils/logger';
import { DEEP_LINK_AUTH_CALLBACK, DEEP_LINK_DRIVE_CALLBACK } from '@/utils/constants';
import type { DriveConnectionDto } from '@/generated';

if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

interface AddDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddDriveModal({ isOpen, onClose }: AddDriveModalProps) {
  const { addDrive } = useDrivesStore();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Deep Link リスナー
   * OAuth認証完了後、バックエンドから connectionId を受け取る
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleDeepLink = ({ url }: { url: string }) => {
      appLogger.info(`[AddDriveModal] Deep link 受信: ${url}`);

      const parsed = Linking.parse(url);
      const { queryParams } = parsed;

      if (queryParams) {
        const connectionId = queryParams.connectionId as string | undefined;
        const provider = queryParams.provider as string | undefined;
        const account = queryParams.account as string | undefined;

        appLogger.info(
          `[AddDriveModal] Deep link パラメータ: connectionId=${!!connectionId}, provider=${provider}, account=${account}`
        );

        if (connectionId && provider && account) {
          try {
            appLogger.info(
              `[AddDriveModal] 新しいドライブが接続 (connectionId=${connectionId}, provider=${provider}, account=${account})`
            );

            // ✅ Deep Link から取得したデータでドライブオブジェクトを構築
            const newDrive: DriveConnectionDto = {
              id: connectionId,
              provider: provider,
              account: account, // サーバーから受け取ったメールアドレスを使用
              status: 'connected',
              connectedAt: new Date(),
            };

            // ✅ Zustand ストアに新しいドライブを追加
            addDrive(newDrive);
            appLogger.info(`[AddDriveModal] ドライブをストアに追加しました (id=${connectionId}, account=${account})`);
            
            // ✅ 状態をリセット
            setSelectedProvider(null);
            setIsLoading(false);
            setError(null);

            appLogger.info('[AddDriveModal] モーダルを閉じます');
            onClose();
          } catch (e) {
            appLogger.error('[AddDriveModal] ドライブ追加エラー', e);
            setError('ドライブの追加に失敗しました');
          }
        }
      }
    };

    // 初期 Deep Link チェック
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl != null) {
        appLogger.info(`[AddDriveModal] 初期 Deep Link: ${initialUrl}`);
        handleDeepLink({ url: initialUrl });
      }
    };

    checkInitialUrl();

    // リスナー登録
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [isOpen, onClose]);

  /**
   * ドライブ接続を開始
   */
  const handleConnectDrive = async (providerId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      setSelectedProvider(providerId);

      appLogger.info(
        `[AddDriveModal] ドライブ接続開始 (provider=${providerId})`
      );

      // ✅ OAuth認可URLを取得
      const result =
        await driveConnectionService.initiateDriveConnection(providerId);
      appLogger.info('[AddDriveModal] OAuth URL 取得成功');

      const authorizeUrl = result.authorizeUrl;
      if (!authorizeUrl) {
        throw new Error('authorize_url が含まれていません');
      }

      appLogger.info(
        `[AddDriveModal] ブラウザで OAuth を開く`
      );

      // ✅ Webブラウザでの認証セッションを開始
      // ⚠️ redirectUrl（第2引数）はブラウザセッション完了検出用で、
      // ディープリンク受信は Linking.addEventListener で別途処理
      const browserResult = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        DEEP_LINK_DRIVE_CALLBACK
      );

      appLogger.info(
        `[AddDriveModal] ブラウザセッション結果: type=${browserResult.type}`
      );

      // ✅ ブラウザセッション成功時に、URL から接続情報を抽出
      if (browserResult.type === 'success') {
        appLogger.info('[AddDriveModal] ブラウザセッション成功');

        // WebBrowser がリダイレクト URL を受け取った場合
        if ('url' in browserResult && browserResult.url) {
          appLogger.info(`[AddDriveModal] Redirect URL 受信: ${browserResult.url}`);

          // URL をパース
          const parsed = Linking.parse(browserResult.url);
          const { queryParams } = parsed;

          if (queryParams) {
            // バックエンドから送信されるパラメータ:
            // ✅ sessionId: Express Session ID
            // ✅ provider: プロバイダー名
            // ✅ connectionId: ドライブ接続ID
            const sessionId = queryParams.sessionId as string | undefined;
            const provider = queryParams.provider as string | undefined;
            const connectionId = queryParams.connectionId as string | undefined;
            const account = queryParams.account as string | undefined;

            appLogger.info(
              `[AddDriveModal] クエリパラメータ: sessionId=${!!sessionId}, provider=${provider}, connectionId=${connectionId}`
            );

            if (connectionId && provider && account) {
              try {
                appLogger.info(
                  `[AddDriveModal] 新しいドライブが接続 (connectionId=${connectionId}, provider=${provider}, account=${account})`
                );

                // ✅ Redirect URL から取得したデータでドライブオブジェクトを構築
                const newDrive: DriveConnectionDto = {
                  id: connectionId,
                  provider: provider,
                  account: account, // サーバーから受け取ったメールアドレスを使用
                  status: 'connected',
                  connectedAt: new Date(),
                };

                // ✅ Zustand ストアに新しいドライブを追加
                addDrive(newDrive);
                appLogger.info(`[AddDriveModal] ドライブをストアに追加しました (id=${connectionId}, account=${account})`);

                // ✅ 状態をリセット
                setSelectedProvider(null);
                setIsLoading(false);
                setError(null);

                appLogger.info('[AddDriveModal] モーダルを閉じます');
                onClose();
              } catch (e) {
                appLogger.error('[AddDriveModal] ドライブ追加エラー', e);
                setError('ドライブの追加に失敗しました');
                setIsLoading(false);
                setSelectedProvider(null);
              }
            } else {
              appLogger.warning('[AddDriveModal] connectionId がありません');
              setError('接続ID を取得できませんでした');
              setIsLoading(false);
              setSelectedProvider(null);
            }
          }
        }
      } else if (browserResult.type === 'dismiss') {
        appLogger.warning('[AddDriveModal] ユーザーがブラウザを閉じた');
        setError('認証がキャンセルされました');
        setIsLoading(false);
        setSelectedProvider(null);
      }
    } catch (err) {
      appLogger.error('[AddDriveModal] ドライブ接続失敗', err);
      setError(
        err instanceof Error
          ? `接続失敗: ${err.message}`
          : 'ドライブの接続に失敗しました'
      );
      setIsLoading(false);
      setSelectedProvider(null);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <View className="bg-white rounded-t-3xl pt-6 pb-8">
          {/* ✅ ヘッダー */}
          <View className="flex-row items-center justify-between px-6 mb-6">
            <Text className="text-xl font-bold text-gray-900">
              ドライブを接続
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              className="w-10 h-10 justify-center items-center rounded-full bg-gray-100"
            >
              <Text className="text-xl text-gray-600">✕</Text>
            </TouchableOpacity>
          </View>

          {/* ✅ スクロール可能なコンテンツ */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          >
            {/* エラーメッセージ */}
            {error && (
              <View className="bg-red-50 rounded-lg p-3 mb-6">
                <Text className="text-red-900 text-xs text-center">{error}</Text>
              </View>
            )}

            {/* サブテキスト */}
            <Text className="text-sm text-gray-600 mb-6 text-center">
              接続したいクラウドストレージを選択してください
            </Text>

            {/* ボタングループ */}
            <View className="gap-4">
              <GoogleButton
                onPress={() => handleConnectDrive('google')}
                disabled={isLoading}
                loading={selectedProvider === 'google' && isLoading}
                label="Google Drive を接続"
              />

              <MicrosoftButton
                onPress={() => handleConnectDrive('onedrive')}
                disabled={isLoading}
                loading={selectedProvider === 'onedrive' && isLoading}
                label="Microsoft OneDrive を接続"
              />
            </View>

            {/* ローディング表示 */}
            {isLoading && (
              <View className="mt-6 items-center">
                <ActivityIndicator size="large" color="#1976d2" />
                <Text className="text-gray-600 mt-3 text-center text-sm">
                  ブラウザで認証を進めてください
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}