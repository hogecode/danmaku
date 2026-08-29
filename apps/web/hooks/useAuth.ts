'use client';

import { useEffect, useState, useCallback } from 'react';
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
 * 認証 Hook
 */
export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * ユーザー情報を取得
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await authClient.getUserInfo();
      setUser(userData);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        setUser(null);
        setError(null);
      } else if (err instanceof Error) {
        setError(err);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ログイン開始
   */
  const startLogin = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authClient.login();
      const { authorize_url } = response;
      window.location.href = authorize_url;
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ログアウト
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authClient.logout();
      setUser(null);
      setError(null);
      window.location.href = '/';
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * トークン更新
   */
  const refreshToken = useCallback(async () => {
    try {
      await authClient.refreshToken();
      await fetchUserInfo();
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  }, [fetchUserInfo]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    fetchUserInfo();
  }, [isMounted, fetchUserInfo]);

  return {
    user,
    loading,
    error,
    fetchUserInfo,
    startLogin,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };
}
