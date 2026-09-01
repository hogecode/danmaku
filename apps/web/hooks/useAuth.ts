'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import type { UserInfoDto, LoginResponseDto } from '@/lib/generated';

/**
 * ユーザー情報型
 */
export type UserInfo = UserInfoDto;

/**
 * ログイン開始レスポンス型
 */
export type LoginResponse = LoginResponseDto;

/**
 * 
 * 以下の機能を提供：
 * - ユーザー情報の自動取得・キャッシング
 * - ログイン・ログアウト・トークン更新
 * - 自動エラーハンドリング
 * - 手動リフレッシュ
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // ✅ ユーザー情報取得（自動キャッシング）
  const {
    data: user = null,
    isLoading,
    error,
    refetch: fetchUserInfo,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const userData = await authClient.getUserInfo();
        return userData;
      } catch (err) {
        // 401 Unauthorized の場合は null を返す
        if (err instanceof Error && err.message.includes('401')) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5分
    gcTime: 1000 * 60 * 30,    // 30分
    retry: 1,
    refetchInterval: 1000 * 60 * 10, // 10分ごとに自動リフェッチ
  });

  // ✅ ログイン mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await authClient.login();
      return response;
    },
    onSuccess: (response) => {
      const { authorize_url } = response;
      // Google OAuth フローに遷移
      window.location.href = authorize_url;
    },
    onError: (error) => {
      console.error('[useAuth] Login error:', error);
    },
  });

  // ✅ ログアウト mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.logout();
    },
    onSuccess: () => {
      // ✅ キャッシュをクリア
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.clear();
      // ホームにリダイレクト
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('[useAuth] Logout error:', error);
    },
  });

  // ✅ トークン更新 mutation
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await authClient.refreshToken();
      return response;
    },
    onSuccess: () => {
      // ✅ ユーザー情報を再取得
      fetchUserInfo();
    },
    onError: (error) => {
      console.error('[useAuth] Token refresh error:', error);
    },
  });

  // ✅ ログイン開始（mutation を実行）
  // TODO: tanstack queryを利用
  const startLogin = useCallback(async () => {
    await loginMutation.mutateAsync();
  }, [loginMutation]);

  // ✅ ログアウト（mutation を実行）
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  // ✅ トークン更新（mutation を実行）
  const refreshToken = useCallback(async () => {
    await refreshTokenMutation.mutateAsync();
  }, [refreshTokenMutation]);


  return {
    // ✅ ユーザー情報
    user,
    isAuthenticated: !!user,

    // ✅ ローディング・エラー状態
    loading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: (error instanceof Error ? error : null) || loginMutation.error || logoutMutation.error || refreshTokenMutation.error,

    // ✅ アクション
    fetchUserInfo,
    startLogin,
    logout,
    refreshToken,

    // ✅ 各 mutation の状態（細粒度制御用）
    loginPending: loginMutation.isPending,
    logoutPending: logoutMutation.isPending,
    refreshTokenPending: refreshTokenMutation.isPending,
  };
}
