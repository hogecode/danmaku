/**
 * 認証カスタムフック
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth-service';
import { appLogger } from '@/utils/logger';
import { UserInfo } from '@/types';
import { UserInfoDtoFromJSON } from '@/generated';

export function useAuth() {
  const auth = useAuthStore();

  /**
   * ログイン処理
   * ✅ プロバイダーを指定して OAuth フロー開始
   */
  const login = useCallback(async (provider: string = 'onedrive') => {
    try {
      auth.setError(null);
      auth.setLoading(true);

      appLogger.info(`[useAuth] ログイン開始 (provider=${provider})`);

      const result = await authService.login(provider);

      appLogger.info('[useAuth] OAuth URL 取得成功');
      return result;
    } catch (error) {
      appLogger.error('[useAuth] ログイン失敗', error);
      auth.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      auth.setLoading(false);
    }
  }, [auth]);

  /**
   * OAuth 完了確認
   */
  const completeOAuth = useCallback(async (): Promise<boolean> => {
    try {
      auth.setLoading(true);

      appLogger.info('[useAuth] OAuth 完了確認開始');

      // GET /api/auth/me で認証状態を確認
      const userInfo = await authService.getUserInfo();

      auth.setUser(userInfo);
      auth.setIsAuthenticated(true);

      appLogger.info('[useAuth] ✅ OAuth 完了確認成功');
      return true;
    } catch (error) {
      appLogger.warning('[useAuth] ⚠️ OAuth 完了確認失敗（セッションなし）', error);
      return false;
    } finally {
      auth.setLoading(false);
    }
  }, [auth]);

  /**
   * ユーザー情報を取得
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      auth.setError(null);
      auth.setLoading(true);

      appLogger.info('[useAuth] ユーザー情報取得開始');

      const userInfo = await authService.getUserInfo();

      auth.setUser(userInfo);
      auth.setIsAuthenticated(true);

      appLogger.info('[useAuth] ユーザー情報取得成功');
    } catch (error) {
      appLogger.error('[useAuth] ユーザー情報取得失敗', error);
      auth.setError(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      auth.setLoading(false);
    }
  }, [auth]);

  /**
   * ✅ sessionId とユーザー情報を保存（Deep link 経由）
   */
  const saveSessionAndSetUser = useCallback(
    async (userInfo: any, sessionId: string) => {
      try {
        auth.setLoading(true);
        auth.setError(null);

        appLogger.info('[useAuth] ==================== sessionId とユーザー情報を保存 ====================');

        // ✅ userInfo をマッピング（picture_url → pictureUrl）
        const mappedUserInfo = UserInfoDtoFromJSON(userInfo);
        appLogger.debug('[useAuth] マッピング前 picture_url:', (userInfo as any).picture_url);
        appLogger.debug('[useAuth] マッピング後 pictureUrl:', mappedUserInfo.pictureUrl);

        // sessionId と状態を更新（persist middleware で自動保存）
        auth.setSessionId(sessionId);
        auth.setUser(mappedUserInfo);
        auth.setIsAuthenticated(true);

        appLogger.info('[useAuth] 🎉 AuthState を更新完了 (isAuthenticated=true, sessionId=saved)');
      } catch (error) {
        appLogger.error('[useAuth] ⛔ sessionId 保存失敗', error);
        auth.setError(error instanceof Error ? error.message : String(error));
        throw error;
      } finally {
        auth.setLoading(false);
      }
    },
    [auth]
  );

  /**
   * ログアウト
   * 1. サーバーの /api/auth/logout を呼ぶ
   * 2. ローカル状態をリセット
   */
  const logout = useCallback(async () => {
    try {
      auth.setLoading(true);
      auth.setError(null);

      appLogger.info('[useAuth] ログアウト開始');

      // ✅ Step 1: サーバーにログアウトリクエストを送信
      try {
        await authService.logout();
        appLogger.info('[useAuth] サーバーログアウト成功');
      } catch (error) {
        // サーバーでのログアウト失敗をログするが、ローカルリセットは続行
        appLogger.warning('[useAuth] サーバーログアウト失敗（ローカルリセットは実行）', error);
      }

      // ✅ Step 2: ローカル状態をリセット（セキュアストレージから削除）
      auth.reset();

      appLogger.info('[useAuth] ✅ ログアウト完了（サーバー＋ローカル）');
    } catch (error) {
      appLogger.error('[useAuth] ⛔ ログアウト処理中にエラー', error);
      auth.setError(error instanceof Error ? error.message : String(error));
      // ログアウトエラーでも状態はリセット（セッション情報を確実に削除）
      auth.reset();
      throw error;
    } finally {
      auth.setLoading(false);
    }
  }, [auth]);

  return {
    ...auth,
    login,
    completeOAuth,
    fetchUserInfo,
    saveSessionAndSetUser,
    logout,
  };
}
