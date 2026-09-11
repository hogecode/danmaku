import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth-store';
import { appLogger } from '@/utils/logger';
import '../../global.css';

// スプラッシュスクリーンを自動的に非表示にしないように設定
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // デバイスのカラースキームを取得
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        appLogger.info('[RootLayout] 認証状態を復元中...');
        
        // Zustand の persist middleware が自動的にセキュアストレージから復元
        // ここで store にアクセスすることで復元が完了する
        const state = useAuthStore.getState();
        
        if (state.isAuthenticated) {
          appLogger.info(`[RootLayout] ✅ 認証状態を復元: isAuthenticated=true, user=${state.user?.name || 'unknown'}`);
        } else {
          appLogger.info('[RootLayout] ℹ️ 認証状態なし（新規ユーザーまたはログアウト状態）');
        }
      } catch (error) {
        appLogger.error('[RootLayout] 認証状態の復元に失敗', error);
      } finally {
        // スプラッシュスクリーンを非表示にする
        await SplashScreen.hideAsync();
      }
    };

    initializeAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: true,
            }}
          />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
