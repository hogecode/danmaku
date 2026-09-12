import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../../../database/database.module';
import axios, { AxiosError } from 'axios';
import Redis from 'ioredis';
import { UserService } from '../../user.service';
import { LoggerService } from '../../../../common/logger/logger.service';
import { TokenService } from '../../token.service';
import { GoogleUserInfoDto, UserInfoDto } from '../../../dto';
import { ProviderType } from '../../../../drive/constants';
import { ProviderAuthService } from '../provider-auth.interface';

/**
 * Google OAuth 認証実装
 */
@Injectable()
export class GoogleAuthService implements ProviderAuthService {
  private readonly googleUserInfoUrl =
    'https://openidconnect.googleapis.com/v1/userinfo';

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Google OAuth コールバック処理
   * 認可コードからアクセストークンを取得し、ユーザー情報を取得してDBに保存する
   */
  async handleCallback(code: string, state: string): Promise<UserInfoDto> {
    const verifierKey = `oauth:verifier:google:${state}`;
    const verifier = await this.redis.get(verifierKey);

    if (!verifier) {
      throw new BadRequestException('Code verifier not found');
    }

    try {
      const baseRedirectUri = this.configService.get<string>(
        'GOOGLE_REDIRECT_URI',
      );
      if (!baseRedirectUri) {
        throw new InternalServerErrorException(
          'Google OAuth configuration missing',
        );
      }

      const tokenData = await this.tokenService.exchangeCodeForToken(
        code,
        verifier,
        baseRedirectUri,
        ProviderType.GOOGLE,
      );

      const googleUser = await this.fetchUserInfo(tokenData.access_token);

      const user = await this.userService.upsertUser(googleUser);

      // ログイン用 Auth Identity を作成
      await this.userService.upsertAuthIdentity(
        user.id,
        googleUser,
        ProviderType.GOOGLE,
      );

      // Drive接続情報を保存（トークン暗号化）
      await this.userService.upsertDriveConnection(
        user.id,
        googleUser,
        tokenData,
        ProviderType.GOOGLE,
      );

      // 接続済みドライブ情報を取得
      const userInfo = await this.userService.getUserInfo(user.id);

      return userInfo;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('[GOOGLE_AUTH] Callback error', error as Error);
      throw new InternalServerErrorException(
        'Failed to process Google OAuth callback',
      );
    }
  }

  /**
   * Google ユーザー情報を取得
   */
  async fetchUserInfo(accessToken: string): Promise<GoogleUserInfoDto> {
    try {
      const response = await axios.get<GoogleUserInfoDto>(
        this.googleUserInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          '[GOOGLE_AUTH] User info fetch error',
          error.response?.data,
        );
        throw new InternalServerErrorException(
          'Failed to fetch Google user info',
        );
      }
      throw error;
    }
  }
}
