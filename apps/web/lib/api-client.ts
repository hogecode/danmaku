'use client';

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { Configuration, AuthApi, UserInfoDto, LoginResponseDto } from './generated';

/**
 * APIクライアントの設定と初期化
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private authApi: AuthApi;

  constructor() {
    // Axiosインスタンスを作成
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/',
      withCredentials: true, // クッキーを送信
      timeout: 10000,
    });

    // OpenAPI Configurationを作成
    const configuration = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
      baseOptions: {
        withCredentials: true,
      },
    });

    // AuthApiを初期化
    this.authApi = new AuthApi(configuration, undefined, this.axiosInstance);
  }

  /**
   * ログイン開始
   */
  async login(): Promise<LoginResponseDto> {
    try {
      const response = await this.authApi.authControllerLogin();
      // AxiosPromiseからデータを抽出
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * ユーザー情報を取得
   */
  async getUserInfo(): Promise<UserInfoDto> {
    try {
      const response = await this.authApi.authControllerGetUserInfo();
      // AxiosPromiseからデータを抽出
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      await this.authApi.authControllerLogout();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * トークン更新
   */
  async refreshToken(): Promise<any> {
    try {
      const response = await this.authApi.authControllerRefreshToken();
      // AxiosPromiseからデータを抽出
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * OAuthコールバック処理
   */
  async handleOAuthCallback(code: string, state: string): Promise<UserInfoDto> {
    try {
      const response = await this.authApi.authControllerCallback(code, state);
      // callbackはvoidを返すため、直接handleするのは難しい
      // 代わりにgetUserInfoを呼び出す
      return await this.getUserInfo();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: any) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error(`API Error [${status}]:`, data);

      // 401 Unauthorized の場合、トークン更新を試みる
      if (status === 401) {
        // トークンが無効な場合、ここでハンドリング
        console.warn('Unauthorized. Token may have expired.');
      }
    } else if (error instanceof Error) {
      console.error('Unexpected error:', error.message);
    }
  }
}

// シングルトンインスタンスを作成
export const apiClient = new ApiClient();
