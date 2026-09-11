/**
 * Google OAuth ログイン画面
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { appLogger } from '@/utils/logger';
import { DEEP_LINK_AUTH_CALLBACK } from '@/utils/constants';

if (Platform.OS === 'web') {
  // Web での認証セッションを完了させるための処理
  WebBrowser.maybeCompleteAuthSession();
}

export default function LoginScreen() {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Deep link リスナー（バックグラウンドから戻ってきた場合に対応）
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      appLogger.info(`[LoginScreen] Deep link 受信: ${url}`);

      // Deep link を解析
      const parsed = Linking.parse(url);
      const { queryParams } = parsed;

      if (queryParams) {
        // Backend から送信されるパラメータ:
        // - token: JWT アクセストークン
        // - user: ユーザー情報（JSON 文字列）
        const token = queryParams.token as string | undefined;
        const userParam = queryParams.user as string | undefined;

        appLogger.info(
          `[LoginScreen] Deep link パラメータ: token=${!!token}, user=${!!userParam}`
        );

        if (token && userParam) {
          try {
            const user = JSON.parse(userParam);
            appLogger.info(`[LoginScreen] ユーザー情報パース成功: id=${user.id}, name=${user.name}`);
            
            auth.saveTokenAndSetUser(user, token).then(() => {
              appLogger.info('[LoginScreen] Deep link からトークン保存成功、ホーム画面に遷移');
              router.replace('/');
            });
          } catch (e) {
            appLogger.error('[LoginScreen] ユーザー情報のパース失敗', e);
            setError('認証情報が正しくありません');
          }
        } else {
          appLogger.warning('[LoginScreen] トークンまたはユーザー情報がありません', {
            token,
            userParam,
          });
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

  // ログインボタンを押したときの処理
  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoggingIn(true);

      appLogger.info('[LoginScreen] ログイン開始');

      const loginResult = await auth.login();
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

        // WebBrowser が成功した場合、URL からトークンを抽出
        if ('url' in result && result.url) {
          appLogger.info(`[LoginScreen] Redirect URL 受信: ${result.url}`);
          const parsed = Linking.parse(result.url);
          const { queryParams } = parsed;

          if (queryParams) {
            // Backend から送信されるパラメータ:
            // - token: JWT アクセストークン
            // - user: ユーザー情報（JSON 文字列）
            const token = queryParams.token as string | undefined;
            const userParam = queryParams.user as string | undefined;

            appLogger.info(`[LoginScreen] クエリパラメータ: token=${!!token}, user=${!!userParam}`);

            if (token && userParam) {
              try {
                const user = JSON.parse(userParam);
                appLogger.info(`[LoginScreen] ユーザー情報パース成功: id=${user.id}, name=${user.name}`);
                await auth.saveTokenAndSetUser(user, token);
                appLogger.info('[LoginScreen] トークン保存成功、ホーム画面に遷移');
                router.replace('/');
              } catch (e) {
                appLogger.error('[LoginScreen] ユーザー情報のパース失敗', e);
                setError('認証情報が正しくありません');
              }
            } else {
              appLogger.warning('[LoginScreen] トークンまたはユーザー情報がありません', {
                token,
                userParam,
              });
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
            Google Drive のビデオを再生できます
          </Text>

          {error && (
            <View className="bg-red-50 rounded-lg p-3 mb-6 w-full">
              <Text className="text-red-900 text-xs text-center">{error}</Text>
            </View>
          )}

          <TouchableOpacity
            className={`rounded-lg py-3 px-8 flex-row items-center gap-2 mb-8 ${
              isLoggingIn || auth.loading ? 'bg-blue-300' : 'bg-blue-500'
            }`}
            onPress={handleLogin}
            disabled={isLoggingIn || auth.loading}
          >
            {isLoggingIn || auth.loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text className="text-lg">🔐</Text>
                <Text className="text-white text-base font-semibold">Googleログイン</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}