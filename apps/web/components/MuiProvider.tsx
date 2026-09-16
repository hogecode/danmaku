/**
 * MUI Theme Provider コンポーネント
 * SSR対応
 */

'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';

interface MuiProviderProps {
  children: ReactNode;
}

/**
 * MUI ThemeProvider ラッパーコンポーネント
 * ✅ CssBaselineでブラウザのデフォルトスタイルをリセット
 */
export function MuiProvider({ children }: MuiProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
