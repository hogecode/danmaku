/**
 * MUI Theme設定
 * SSR対応のテーマ定義（ライト・ダークモード対応）
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * ライトテーマの設定
 */
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000de',
      secondary: '#0000008b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
};

/**
 * ダークテーマの設定
 */
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffffde',
      secondary: '#ffffff8b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
};

/**
 * テーマを作成（mode に基づいて）
 * @param mode - 'light' | 'dark'
 * @returns MUI Theme
 */
export function createAppTheme(mode: 'light' | 'dark' = 'light') {
  const themeOptions = mode === 'dark' ? darkThemeOptions : lightThemeOptions;
  return createTheme(themeOptions);
}

/**
 * デフォルトテーマ（ライト）
 */
export const theme = createAppTheme('light');

/**
 * サポートされているテーマモード
 */
export const SUPPORTED_THEMES = ['light', 'dark'] as const;
export type SupportedTheme = (typeof SUPPORTED_THEMES)[number];

/**
 * テーマモード値の検証
 * @param value - 検証する値
 * @returns true if valid theme mode
 */
export function isValidThemeMode(value: any): value is SupportedTheme {
  return SUPPORTED_THEMES.includes(value);
}

/**
 * デフォルトテーマモード
 */
export const DEFAULT_THEME: SupportedTheme = 'light';
