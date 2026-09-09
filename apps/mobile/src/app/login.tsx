/**
 * Google OAuth ログイン画面
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  WebBrowser.maybeCompleteAuthSession();
}

export default function LoginScreen() {
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Deep link リスナー
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      appLogger.info(`[LoginScreen] Deep link 受信: ${url}`);

      const parsed = Linking.parse(url);
      const { queryParams } = parsed;

      if (queryParams) {
        const token = queryParams.token as string | undefined;
        const userInfo = queryParams.user_info as string | undefined;

        if (token && userInfo) {
          try {
            const user = JSON.parse(userInfo);
            auth.saveTokenAndSetUser(user, token).then(() => {
              router.replace('/');
            });
          } catch (e) {
            appLogger.error('[LoginScreen] ユーザー情報のパース失敗', e);
            setError('認証情報が正しくありません');
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [auth]);

  const handleLogin = async () => {
    try {
      setError(null);
      setIsLoggingIn(true);

      appLogger.info('[LoginScreen] ログイン開始');

      const loginResult = await auth.login();
      appLogger.info('[LoginScreen] OAuth URL 取得成功');

      const authorizeUrl = loginResult.authorize_url;
      if (!authorizeUrl) {
        throw new Error('authorize_url が含まれていません');
      }

      appLogger.info('[LoginScreen] ブラウザで OAuth ページを開く');

      const result = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        DEEP_LINK_AUTH_CALLBACK
      );

      if (result.type === 'success') {
        appLogger.info('[LoginScreen] ブラウザセッション成功');
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎬</Text>
          </View>

          <Text style={styles.title}>Danmaku</Text>
          <Text style={styles.subtitle}>
            Google Drive のビデオを再生できます
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoggingIn && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoggingIn || auth.loading}
          >
            {isLoggingIn || auth.loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginButtonIcon}>🔐</Text>
                <Text style={styles.loginButtonText}>Google ログイン</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>ログインについて</Text>
            <Text style={styles.infoText}>
              • Google アカウントで安全にログイン
            </Text>
            <Text style={styles.infoText}>
              • Google Drive のビデオファイルにアクセス可能
            </Text>
            <Text style={styles.infoText}>
              • リアルタイムコメント表示対応
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  loginButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  loginButtonIcon: {
    fontSize: 18,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
});