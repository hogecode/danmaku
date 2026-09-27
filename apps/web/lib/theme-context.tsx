/**
 * テーマ管理用 Context
 * useUserSettings と連携して動的にテーマを切り替える
 */

'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { SupportedTheme, createAppTheme, isValidThemeMode, DEFAULT_THEME } from './theme';

/**
 * Theme Context の型定義
 */
interface ThemeContextType {
  themeMode: SupportedTheme;
  setThemeMode: (mode: SupportedTheme) => void;
}

/**
 * Theme Context を作成
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Context Provider
 */
interface ThemeContextProviderProps {
  children: ReactNode;
  initialTheme?: SupportedTheme;
}

export function ThemeContextProvider({
  children,
  initialTheme = DEFAULT_THEME,
}: ThemeContextProviderProps) {
  // Initialize theme mode from initialTheme, or detect system preference
  const getInitialTheme = (): SupportedTheme => {
    if (isValidThemeMode(initialTheme)) {
      return initialTheme;
    }
    
    // Only check system preference on client-side
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    return DEFAULT_THEME;
  };

  const [themeMode, setThemeMode] = React.useState<SupportedTheme>(
    getInitialTheme(),
  );

  // Sync theme mode to localStorage and HTML element
  React.useEffect(() => {
    localStorage.setItem('app-theme', themeMode);
    document.documentElement.setAttribute('data-theme-mode', themeMode);
  }, [themeMode]);

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (isValidThemeMode(savedTheme)) {
      setThemeMode(savedTheme);
    }
  }, []);

  const value: ThemeContextType = useMemo(
    () => ({
      themeMode,
      setThemeMode,
    }),
    [themeMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Theme Context を使用する Hook
 */
export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContextProvider');
  }
  return context;
}

/**
 * テーマを取得する Hook
 * @returns 現在のテーマ（MUI Theme オブジェクト）
 */
export function useTheme() {
  const { themeMode } = useThemeContext();
  return useMemo(() => createAppTheme(themeMode), [themeMode]);
}

/**
 * テーマモードを変更する Hook
 * @returns テーマモード変更用の関数
 */
export function useSetTheme() {
  const { setThemeMode } = useThemeContext();
  return setThemeMode;
}
