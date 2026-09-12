/**
 * 認証サービス
 * OpenAPI 自動生成クライアントを使用
 */

import { appLogger } from '@/utils/logger';
import { LoginResponseDto, UserInfoDto } from '@/generated';
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
   * POST /api/auth/login/:provider
   * @param provider - プロバイダー名 ('onedrive', 'google', etc.)
   * @returns {authorize_url, state, expires_in}
   */
  async login(provider: string): Promise<LoginResponseDto> {
    try {
      appLogger.info(`AuthService: ログイン開始 (provider=${provider})`);

      const response = await this.authApi.authControllerLoginWithProvider({
        provider,
      });

      appLogger.info('AuthService: ログイン成功');
      return response;
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
   * OAuth コールバック処理
   * GET /api/auth/callback/:provider
   * @param provider - プロバイダー名
   * @param code - OAuth 認可コード
   * @param state - CSRF トークン
   * @param error - エラーコード（オプション）
   * @param errorDescription - エラー説明（オプション）
   */
  async handleCallback(
    provider: string,
    code: string,
    state: string,
    error?: string,
    errorDescription?: string
  ): Promise<void> {
    try {
      appLogger.info(
        `AuthService: OAuth コールバック処理中 (provider=${provider})`
      );

      await this.authApi.authControllerCallbackWithProvider({
        provider,
        code,
        state,
        error,
        errorDescription,
      });

      appLogger.info('AuthService: OAuth コールバック処理完了');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStatus = (error as any)?.status || (error as any)?.response?.status;
      appLogger.error('AuthService: OAuth コールバック処理失敗', {
        message: errorMsg,
        status: errorStatus,
      });
      throw new AuthException(`Callback handling failed: ${errorMsg}`, errorStatus);
    }
  }

  /**
   * ユーザー情報取得
   * GET /api/auth/me
   * @returns {id, name, email, picture_url, ...}
   */
  async getUserInfo(): Promise<UserInfoDto> {
    try {
      appLogger.info('AuthService: ユーザー情報取得開始');

      const response = await this.authApi.authControllerGetUserInfo();

      appLogger.info('AuthService: ユーザー情報取得成功');
      return response;
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
}

export const authService = new AuthService();
