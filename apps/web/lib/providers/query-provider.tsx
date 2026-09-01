'use client';

/**
 * TanStack Query Provider
 * クライアント側で QueryClient を提供
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * QueryClient 設定
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30, // 30分（旧：cacheTime）
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * QueryClientProvider ラッパーコンポーネント
 * 
 * App ルートレイアウトで使用：
 * ```tsx
 * <QueryProvider>
 *   <YourApp />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * QueryClient をエクスポート
 * DevTools などで使用する場合
 */
export { queryClient };
