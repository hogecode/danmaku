/**
 * 認証サービス
 * OpenAPI 自動生成クライアントを使用
 */

import { appLogger } from '@/utils/logger';
import { LoginResponse, UserInfo } from '@/types';
import { AuthApi } from '@/generated';
import { createApiConfiguration } from './api-config';

export class AuthException extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(`AuthException: ${message} (status: ${statusCode})`);
  }
}

export class AuthService {
  private authApi: AuthApi;

  constructor() {
    try {
      // OpenAPI Configuration を設定
      const config = createApiConfiguration();
      this.authApi = new AuthApi(config);
      appLogger.info('AuthService: 初期化完了');
    } catch (error) {
      appLogger.error('AuthService: 初期化失敗', error);
      throw error;
    }
  }

  /**
   * ログイン処理（OAuth URL 取得）
   * POST /api/auth/login
   * @returns {authorize_url, state, expires_in}
   */
  async login(): Promise<LoginResponse> {
    try {
      appLogger.info('AuthService: ログイン開始');

      const response = await this.authApi.authControllerLogin();

      appLogger.info('AuthService: ログイン成功');
      return response as unknown as LoginResponse;
    } catch (error) {
      // エラーの詳細をログに出力
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as any)?.status || (error as any)?.response?.status;
      appLogger.error('AuthService: ログイン失敗', {
        message: errorMsg,
        status: errorStatus,
        error: JSON.stringify(error, null, 2),
      });
      throw new AuthException(`Login failed: ${errorMsg}`, errorStatus);
    }
  }

  /**
   * ユーザー情報取得
   * GET /api/auth/me
   * @returns {id, name, email, picture_url, ...}
   */
  async getUserInfo(): Promise<UserInfo> {
    try {
      appLogger.info('AuthService: ユーザー情報取得開始');

      const response = await this.authApi.authControllerGetUserInfo();

      appLogger.info('AuthService: ユーザー情報取得成功');
      return response as unknown as UserInfo;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as any)?.status || (error as any)?.response?.status;
      appLogger.error('AuthService: ユーザー情報取得失敗', {
        message: errorMsg,
        status: errorStatus,
      });
      throw new AuthException(`Get user info failed: ${errorMsg}`, errorStatus);
    }
  }

  /**
   * ログアウト
   * POST /api/auth/logout
   */
  async logout(): Promise<void> {
    try {
      appLogger.info('AuthService: ログアウト開始');

      await this.authApi.authControllerLogout();

      appLogger.info('AuthService: ログアウト完了');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as any)?.status || (error as any)?.response?.status;
      appLogger.error('AuthService: ログアウト失敗', {
        message: errorMsg,
        status: errorStatus,
      });
      throw new AuthException(`Logout failed: ${errorMsg}`, errorStatus);
    }
  }
}

export const authService = new AuthService();
