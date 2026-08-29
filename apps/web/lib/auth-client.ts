'use client';

import axios, { AxiosInstance } from 'axios';
import { Configuration, AuthApi, UserInfoDto, LoginResponseDto, RefreshTokenResponseDto } from './generated';

/**
 * 認証API クライアント
 */
export class AuthClient {
  private axiosInstance: AxiosInstance;
  private authApi: AuthApi;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/',
      withCredentials: true,
      timeout: 10000,
    });

    const configuration = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
      baseOptions: {
        withCredentials: true,
      },
    });

    this.authApi = new AuthApi(configuration, undefined, this.axiosInstance);
  }

  async login(): Promise<LoginResponseDto> {
    try {
      const response = await this.authApi.authControllerLogin();
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getUserInfo(): Promise<UserInfoDto> {
    try {
      const response = await this.authApi.authControllerGetUserInfo();
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authApi.authControllerLogout();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async refreshToken(): Promise<RefreshTokenResponseDto> {
    try {
      const response = await this.authApi.authControllerRefreshToken();
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any) {
    if (error?.response?.status === 401) {
      console.warn('Unauthorized. Token may have expired.');
    } else if (error instanceof Error) {
      console.error('Auth error:', error.message);
    }
  }
}

export const authClient = new AuthClient();
