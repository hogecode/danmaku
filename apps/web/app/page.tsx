'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ルートページ
 * ログインページにリダイレクト
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/login');
  }, [router]);

  return null;
}
