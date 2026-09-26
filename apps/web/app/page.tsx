'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
/**
 * ルートページ
 * ミドルウェアで /about にリダイレクト済み
 * このコンポーネントに到達することはない
 */
export default function RootPage() {
  
  const router = useRouter();

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return null;
}
