'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { UserInfoDto, LoginResponseDto } from '@/lib/generated';

/**
 * ユーザー情報型（OpenAPI生成型を拡張）
 */
export type UserInfo = UserInfoDto;

/**
 * ログイン開始レスポンス型（OpenAPI生成型を使用）
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
      const userData = await apiClient.getUserInfo();
      setUser(userData);
      setError(null);
    } catch (err) {
      // 認証されていない場合はユーザーをnullに設定（エラーではない）
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
      const response = await apiClient.login();
      const { authorize_url } = response;
      // Google OAuth の認可ページにリダイレクト
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
      await apiClient.logout();
      setUser(null);
      setError(null);
      // ホームページにリダイレクト
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
      await apiClient.refreshToken();
      // トークン更新成功後、ユーザー情報を再取得
      await fetchUserInfo();
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      }
    }
  }, [fetchUserInfo]);

  /**
   * マウント時の初期化
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * マウント後にユーザー情報を取得
   */
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
