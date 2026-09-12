/**
 * OAuth ログイン画面
 * ✅ sessionId ベースの認証フロー対応
 * マルチプロバイダー対応（OneDrive, Google Drive など）
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { useDrivesStore } from '@/stores/drives-store';
import { GoogleSignInButton, MicrosoftSignInButton } from '@/components';
import { appLogger } from '@/utils/logger';
import { DEEP_LINK_AUTH_CALLBACK } from '@/utils/constants';

if (Platform.OS === 'web') {
  // Web での認証セッションを完了させるための処理
  WebBrowser.maybeCompleteAuthSession();
}



export default function LoginScreen() {
  const auth = useAuth();
  const { setDrives } = useDrivesStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // ✅ Deep Link からのユーザー情報を処理
  const handleUserInfoFromDeepLink = (userInfo: any, sessionId: string) => {
    try {
      // 🔧 ユーザー情報をログ出力（デバッグ用）
      appLogger.info(`[LoginScreen] ユーザー情報（完全）: id=${userInfo.id}, name=${userInfo.name}, email=${userInfo.email}`);

      // ✅ ドライブ情報を抽出して drives-store に初期化
      if (userInfo.drives && Array.isArray(userInfo.drives) && userInfo.drives.length > 0) {
        appLogger.info(`[LoginScreen] ドライブ情報を抽出: count=${userInfo.drives.length}`);
        setDrives(userInfo.drives);
      } else {
        appLogger.warning('[LoginScreen] ドライブ情報が含まれていません');
      }

      // ✅ その他のフィールド（picture_url など）
      if (userInfo.picture_url) {
        appLogger.debug(`[LoginScreen] プロフィール画像: ${userInfo.picture_url}`);
      }

      if (userInfo.last_login) {
        appLogger.debug(`[LoginScreen] 最終ログイン: ${userInfo.last_login}`);
      }
    } catch (error) {
      appLogger.error('[LoginScreen] ユーザー情報処理エラー', error);
    }
  };



  // ✅ Deep link リスナー（バックグラウンドから戻ってきた場合に対応）
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      appLogger.info(`[LoginScreen] Deep link 受信: ${url}`);

      // Deep link を解析
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;

      if (queryParams) {
        // Backend から送信されるパラメータ:
        // ✅ sessionId: Express Session ID
        // - user: ユーザー情報（JSON 文字列）
        const sessionId = queryParams.sessionId as string | undefined;
        const userParam = queryParams.user as string | undefined;

        appLogger.info(
          `[LoginScreen] Deep link パラメータ: sessionId=${!!sessionId}, user=${!!userParam}`
        );

        if (sessionId && userParam) {
          try {
            const user = JSON.parse(userParam);
            appLogger.info(
              `[LoginScreen] ユーザー情報パース成功: id=${user.id}, name=${user.name}`
            );

            // ✅ ユーザー情報（drives など）を処理
            handleUserInfoFromDeepLink(user, sessionId);

            // ✅ sessionId とユーザー情報を保存
            auth.saveSessionAndSetUser(user, sessionId).then(() => {
              appLogger.info(
                '[LoginScreen] Deep link から sessionId 保存成功、ホーム画面に遷移'
              );
              router.replace('/');
            });
          } catch (e) {
            appLogger.error('[LoginScreen] ユーザー情報のパース失敗', e);
            setError('認証情報が正しくありません');
          }
        } else {
          appLogger.warning('[LoginScreen] sessionId またはユーザー情報がありません');
          appLogger.debug(`sessionId=${sessionId}, userParam=${userParam}`);
        }
      }
    };

    // 初期 Deep Link のチェック（アプリが Deep Link で起動した場合）
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl != null) {
        appLogger.info(`[LoginScreen] 初期 Deep Link: ${initialUrl}`);
        handleDeepLink({ url: initialUrl });
      }
    };

    checkInitialUrl();

    // リスナーの登録（後続の Deep Link のチェック）
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [auth]);

  // ✅ ログインボタンを押したときの処理
  const handleLogin = async (providerId: string) => {
    try {
      setError(null);
      setIsLoggingIn(true);
      setSelectedProvider(providerId);

      appLogger.info(`[LoginScreen] ログイン開始 (provider=${providerId})`);

      // ✅ プロバイダーを指定してログイン
      const loginResult = await auth.login(providerId);
      appLogger.info('[LoginScreen] OAuth URL 取得成功');

      const authorizeUrl = loginResult.authorizeUrl;
      if (!authorizeUrl) {
        throw new Error('authorize_url が含まれていません');
      }

      appLogger.info(
        `[LoginScreen] ブラウザで OAuth ページを開く (redirectUrl: ${DEEP_LINK_AUTH_CALLBACK})`
      );

      // Webブラウザでの認証セッションを開始
      const result = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        DEEP_LINK_AUTH_CALLBACK
      );

      appLogger.info(
        `[LoginScreen] ブラウザセッション結果: type=${result.type}`
      );

      if (result.type === 'success') {
        appLogger.info('[LoginScreen] ブラウザセッション成功');

        // WebBrowser が成功した場合、URL から sessionId を抽出
        if ('url' in result && result.url) {
          appLogger.info(`[LoginScreen] Redirect URL 受信: ${result.url}`);
          const parsed = Linking.parse(result.url);
          const { queryParams } = parsed;

          if (queryParams) {
            // Backend から送信されるパラメータ:
            // ✅ sessionId: Express Session ID
            // - user: ユーザー情報（JSON 文字列）
            const sessionId = queryParams.sessionId as string | undefined;
            const userParam = queryParams.user as string | undefined;

            appLogger.info(
              `[LoginScreen] クエリパラメータ: sessionId=${!!sessionId}, user=${!!userParam}`
            );

            if (sessionId && userParam) {
              try {
                const user = JSON.parse(userParam);
                appLogger.info(
                  `[LoginScreen] ユーザー情報パース成功: id=${user.id}, name=${user.name}`
                );

                // ✅ ユーザー情報（drives など）を処理
                handleUserInfoFromDeepLink(user, sessionId);

                // ✅ sessionId とユーザー情報を保存
                await auth.saveSessionAndSetUser(user, sessionId);
                appLogger.info(
                  '[LoginScreen] sessionId 保存成功、ホーム画面に遷移'
                );
                router.replace('/');
              } catch (e) {
                appLogger.error('[LoginScreen] ユーザー情報のパース失敗', e);
                setError('認証情報が正しくありません');
              }
            } else {
              appLogger.warning('[LoginScreen] sessionId またはユーザー情報がありません');
              appLogger.debug(`sessionId=${sessionId}, userParam=${userParam}`);
              setError('認証情報を取得できませんでした');
            }
          }
        }
      } else if (result.type === 'dismiss') {
        appLogger.warning('[LoginScreen] ユーザーがブラウザを閉じた');
        setError('認証がキャンセルされました');
      }
    } catch (err) {
      appLogger.error('[LoginScreen] ログイン失敗', err);
      setError(
        err instanceof Error
          ? `ログイン失敗: ${err.message}`
          : 'ログイン失敗'
      );
    } finally {
      setIsLoggingIn(false);
      setSelectedProvider(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <View className="items-center">
          <Text className="text-3xl font-bold mb-2 text-center">Danmaku</Text>
          <Text className="text-sm text-gray-500 mb-8 text-center">
            クラウドストレージのビデオを再生
          </Text>

          {error && (
            <View className="bg-red-50 rounded-lg p-3 mb-6 w-full">
              <Text className="text-red-900 text-xs text-center">{error}</Text>
            </View>
          )}

          {/* ✅ プロバイダー選択ボタン */}
          <View className="gap-4">
            <GoogleSignInButton
              onPress={() => handleLogin('google')}
              disabled={isLoggingIn || auth.loading}
              loading={selectedProvider === 'google' && (isLoggingIn || auth.loading)}
              label="Google Drive でログイン"
            />
            <MicrosoftSignInButton
              onPress={() => handleLogin('onedrive')}
              disabled={isLoggingIn || auth.loading}
              loading={selectedProvider === 'onedrive' && (isLoggingIn || auth.loading)}
              label="Microsoft OneDrive でログイン"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}