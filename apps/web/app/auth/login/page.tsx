'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleButton } from '@/components/GoogleButton';
import { MicrosoftButton } from '@/components/MicrosoftButton';

/**
 * OAuth ログイン画面
 * ✅ OAuth フロー、セッションベースの認証に対応
 * マルチプロバイダー対応（OneDrive, Google Drive など）
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading, startLogin, user } = useAuthContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // マウント時の初期化
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ OAuth コールバック（callback?sessionId=xxx&user=...）を処理
  useEffect(() => {
    if (!isMounted || loading) return;

    // URLからセッション情報を確認
    const sessionId = searchParams.get('sessionId');
    const userParam = searchParams.get('user');

    if (sessionId && userParam) {
      try {
        const userInfo = JSON.parse(userParam);
        console.log('[LoginPage] OAuth コールバック成功:', { id: userInfo.id, name: userInfo.name });
        // ✅ useAuthContextが自動的に処理
        // 認証情報は AuthProvider で管理されるため、ここでは待機
        setTimeout(() => {
          if (isAuthenticated) {
            router.replace('/home');
          }
        }, 500);
      } catch (e) {
        console.error('[LoginPage] ユーザー情報パース失敗:', e);
        setError('認証情報が正しくありません');
      }
    }
  }, [isMounted, searchParams, isAuthenticated, loading, router]);

  // すでに認証されていたらホームへリダイレクト
  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated && !loading && user) {
      console.log('[LoginPage] 認証済み、ホームにリダイレクト');
      router.replace('/home');
    }
  }, [isMounted, isAuthenticated, loading, user, router]);

  // ログインボタン押下時
  const handleLogin = async (provider: string) => {
    try {
      setError(null);
      setLoginLoading(true);
      setSelectedProvider(provider);

      console.log(`[LoginPage] ログイン開始 (provider=${provider})`);

      // startLogin を呼び出すと、OAuth フローに自動的にリダイレクト
      await startLogin(provider);
    } catch (err) {
      console.error('[LoginPage] ログイン失敗:', err);
      setError(
        err instanceof Error
          ? `ログイン失敗: ${err.message}`
          : 'ログイン失敗'
      );
      setLoginLoading(false);
      setSelectedProvider(null);
    }
  };

  // ハイドレーション完了またはローディング中の場合
  if (!isMounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100">
        <div className="animate-spin">
          <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12"></div>
        </div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-100 px-6">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Danmaku</h1>
          <p className="text-sm text-gray-500">
            クラウドストレージのビデオを弾幕付きで再生できるサービスです。
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 rounded-lg p-3 mb-6 w-full">
            <p className="text-red-900 text-xs text-center">{error}</p>
          </div>
        )}

        {/* ✅ プロバイダー選択ボタン */}
        <div className="flex flex-col gap-4">
          <GoogleButton
            onPress={() => handleLogin('google')}
            disabled={loginLoading || loading}
            loading={selectedProvider === 'google' && (loginLoading || loading)}
            label="Google Drive でログイン"
          />
          <MicrosoftButton
            onPress={() => handleLogin('onedrive')}
            disabled={loginLoading || loading}
            loading={selectedProvider === 'onedrive' && (loginLoading || loading)}
            label="Microsoft OneDrive でログイン"
          />
        </div>

        {/* 利用規約・プライバシー */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとします
          </p>
        </div>
      </div>
    </div>
  );
}
