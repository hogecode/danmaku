'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchUserInfo, loginWithProvider, logout } from '@/lib/store/slices/authSlice';
import { setConnections, selectConnection } from '@/lib/store/slices/drivesSlice';
import {
  selectAuthUser,
  selectAuthLoading,
  selectAuthLoginLoading,
  selectAuthLogoutLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectAuthAllLoading,
} from '@/lib/store/selectors';
import type { UserInfoDto, LoginResponseDto } from '@/lib/generated';

/**
 * ユーザー情報型
 */
export type UserInfo = UserInfoDto;

/**
 * ログイン開始レスポンス型
 */
export type LoginResponse = LoginResponseDto;

export function useAuth() {
  const dispatch = useAppDispatch();

  // ✅ Redux状態を取得
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const loginLoading = useAppSelector(selectAuthLoginLoading);
  const logoutLoading = useAppSelector(selectAuthLogoutLoading);
  const error = useAppSelector(selectAuthError);
  const allLoading = useAppSelector(selectAuthAllLoading);

  // ✅ ユーザー情報を取得（初回マウント時）
  useEffect(() => {
    if (!user && !isAuthenticated) {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, user, isAuthenticated]);

  // ✅ ユーザー情報を再取得
  const refetchUserInfo = useCallback(async () => {
    const result = await dispatch(fetchUserInfo());
    
    // ✅ Redux にドライブ接続情報を保存
    if (result.payload && typeof result.payload === 'object' && 'drives' in result.payload) {
      const userInfo = result.payload as UserInfoDto;
      if (userInfo.drives && userInfo.drives.length > 0) {
        dispatch(setConnections(userInfo.drives));
        // 最初のドライブを選択
        dispatch(selectConnection(userInfo.drives[0].id));
        console.log(`[useAuth] Saved ${userInfo.drives.length} connections to Redux`);
      }
    }
  }, [dispatch]);

  // ✅ ログイン開始
  const startLogin = useCallback(async (provider: string = 'google') => {
    try {
      console.log('[useAuth] Cookies before login:', document.cookie);
      const result = await dispatch(loginWithProvider(provider));
      
      // ✅ OAuth URLにリダイレクト
      if (result.payload && typeof result.payload === 'object' && 'authorize_url' in result.payload) {
        const { authorize_url } = result.payload as LoginResponseDto;
        window.location.href = authorize_url;
      }
    } catch (error) {
      console.error('[useAuth] Start login error:', error);
      throw error;
    }
  }, [dispatch]);

  // ✅ ログアウト
  const performLogout = useCallback(async () => {
    await dispatch(logout());
    // ホームにリダイレクト
    window.location.href = '/';
  }, [dispatch]);

  return {
    // ✅ ユーザー情報
    user,
    isAuthenticated,

    // ✅ ローディング・エラー状態
    loading: allLoading,
    error: error ? new Error(error) : null,

    // ✅ アクション
    fetchUserInfo: refetchUserInfo,
    startLogin,
    logout: performLogout,

    // ✅ 各ローディング状態（細粒度制御用）
    loginPending: loginLoading,
    logoutPending: logoutLoading,
  };
}
