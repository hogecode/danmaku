/**
 * MUI Theme Provider コンポーネント
 * SSR対応・ダークモード対応
 */

'use client';

import React, { ReactNode, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/lib/theme';
import { useThemeContext } from '@/lib/theme-context';

interface MuiProviderProps {
  children: ReactNode;
}

/**
 * MUI ThemeProvider ラッパーコンポーネント
 * ✅ CssBaselineでブラウザのデフォルトスタイルをリセット
 * ✅ useThemeContext から現在のテーマモードを取得
 * ✅ テーマモード変更時に自動的にテーマを切り替え
 */
export function MuiProvider({ children }: MuiProviderProps) {
  const { themeMode } = useThemeContext();
  
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
