'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleButton } from '@/components/GoogleButton';
import { MicrosoftButton } from '@/components/MicrosoftButton';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Alert,
  AlertTitle,
  Stack,
  CircularProgress,
  Divider,
} from '@mui/material';

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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 4 }}>
          {/* ヘッダー */}
          <CardHeader
            title="Danmaku"
            titleTypographyProps={{ variant: 'h4', sx: { fontWeight: 700, textAlign: 'center' } }}
            sx={{ pb: 1 }}
          />

          <Divider />

          <CardContent sx={{ pt: 4 }}>
            <Stack spacing={3}>
              {/* サブタイトル */}
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Real-time comment streaming platform for cloud storage videos
              </Typography>

              {/* エラーメッセージ */}
              {error && (
                <Alert severity="error">
                  <AlertTitle>Login Error</AlertTitle>
                  {error}
                </Alert>
              )}

              {/* プロバイダー選択ボタン */}
              <Stack spacing={2}>
                <GoogleButton
                  onPress={() => handleLogin('google')}
                  disabled={loginLoading || loading}
                  loading={selectedProvider === 'google' && (loginLoading || loading)}
                  label="Google Drive Login"
                />
                <MicrosoftButton
                  onPress={() => handleLogin('onedrive')}
                  disabled={loginLoading || loading}
                  loading={selectedProvider === 'onedrive' && (loginLoading || loading)}
                  label="Microsoft OneDrive Login"
                />
              </Stack>

              {/* 利用規約・プライバシー */}
              <Divider />
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                By logging in, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
