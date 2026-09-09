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
      appLogger.error('AuthService: ログイン失敗', error);
      throw new AuthException('Login failed', (error as any)?.status);
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
      appLogger.error('AuthService: ユーザー情報取得失敗', error);
      throw new AuthException('Get user info failed', (error as any)?.status);
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
      appLogger.error('AuthService: ログアウト失敗', error);
      throw new AuthException('Logout failed', (error as any)?.status);
    }
  }
}

export const authService = new AuthService();
