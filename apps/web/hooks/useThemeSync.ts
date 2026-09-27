/**
 * useUserSettings から取得したテーマ設定を Theme Context に同期する Hook
 * API から取得したテーマモードを自動的に MUI テーマに反映
 */

'use client';

import { useEffect } from 'react';
import { useSetTheme } from '@/lib/theme-context';
import { isValidThemeMode } from '@/lib/theme';
import { useUserSettingsQuery } from './useUserSettings';

/**
 * ユーザー設定からテーマを同期する Hook
 * 
 * 使用例：
 * ```tsx
 * function App() {
 *   useThemeSync();  // 自動的にテーマを同期
 *   return <></>;
 * }
 * ```
 */
export function useThemeSync() {
  const setThemeMode = useSetTheme();
  const { data: settings } = useUserSettingsQuery();

  useEffect(() => {
    if (settings?.theme && isValidThemeMode(settings.theme)) {
      setThemeMode(settings.theme);
    }
  }, [settings?.theme, setThemeMode]);
}
