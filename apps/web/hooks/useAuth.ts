'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthApi, Configuration } from '@/lib/generated';
import type { UserInfoDto, LoginResponseDto } from '@/lib/generated';
import { useAppDispatch } from '@/lib/store/hooks';
import { setConnections, selectConnection } from '@/lib/store/slices/drivesSlice';

/**
 * ユーザー情報型
 */
export type UserInfo = UserInfoDto;

/**
 * ログイン開始レスポンス型
 */
export type LoginResponse = LoginResponseDto;

/**
 * AuthApi インスタンスを作成
 */
function createAuthApi(): AuthApi {
  const configuration = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    baseOptions: {
      withCredentials: true,
    },
  });
  return new AuthApi(configuration);
}

export function useAuth() {
  const queryClient = useQueryClient();
  const authApi = createAuthApi();
  const dispatch = useAppDispatch();

  // ✅ ユーザー情報取得（自動キャッシング）
  const {
    data: user = null,
    isLoading,
    error,
    refetch: fetchUserInfo,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await authApi.authControllerGetUserInfo();
      const userInfo = response.data;
      
      // ✅ Redux にドライブ接続情報を保存
      if (userInfo.drives && userInfo.drives.length > 0) {
        dispatch(setConnections(userInfo.drives));
        // 最初のドライブを選択
        dispatch(selectConnection(userInfo.drives[0].id));
        console.log(`[useAuth] Saved ${userInfo.drives.length} connections to Redux`);
      }
      
      return userInfo;
    },
    staleTime: 1000 * 60 * 5, // 5分
    gcTime: 1000 * 60 * 30,    // 30分
    retry: 1,
    refetchInterval: 1000 * 60 * 10, // 10分ごとに自動リフェッチ
  });

  // ✅ ログイン mutation
  const loginMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await authApi.authControllerLoginWithProvider(provider);
      return response.data;
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
      await authApi.authControllerLogout();
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



  // ✅ ログイン開始（mutation を実行）
  // TODO: tanstack queryを利用
  const startLogin = useCallback(async (provider: string = 'google') => {
    try {
      console.log('[useAuth] Cookies before login:', document.cookie);
      await loginMutation.mutateAsync(provider);
    } catch (error) {
      console.error('[useAuth] Start login error:', error);
      throw error;
    }
  }, [loginMutation]);

  // ✅ ログアウト（mutation を実行）
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);




  return {
    // ✅ ユーザー情報
    user,
    isAuthenticated: !!user,

    // ✅ ローディング・エラー状態
    loading: isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: (error instanceof Error ? error : null) || loginMutation.error || logoutMutation.error,

    // ✅ アクション
    fetchUserInfo,
    startLogin,
    logout,

    // ✅ 各 mutation の状態（細粒度制御用）
    loginPending: loginMutation.isPending,
    logoutPending: logoutMutation.isPending,
  };
}
