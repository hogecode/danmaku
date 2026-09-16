/**
 * Emotion SSR Cache設定
 * Next.js App Router対応のSSR対応キャッシュ初期化
 */

'use client';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import React, { ReactNode } from 'react';

/**
 * SSR用EmotionCacheを作成
 * useClientで実行する必要があります
 */
export function createEmotionCache() {
  return createCache({ key: 'css' });
}

interface EmotionCacheProviderProps {
  children: ReactNode;
}

/**
 * Emotion Cache Provider コンポーネント
 * MUIのスタイルをSSRで正しく提供するためのプロバイダー
 */
export function EmotionCacheProvider({ children }: EmotionCacheProviderProps) {
  const cache = createEmotionCache();

  return (
    <CacheProvider value={cache}>
      {children}
    </CacheProvider>
  );
}
