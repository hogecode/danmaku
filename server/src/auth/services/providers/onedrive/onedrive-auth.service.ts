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
import { OAuthAccountService } from '../../user.service';
import { LoggerService } from '../../../../common/logger/logger.service';
import { TokenService } from '../../token.service';
import { GoogleUserInfoDto, UserInfoDto } from '../../../dto';
import { ProviderType } from '../../../../drive/constants';
import { ProviderAuthService } from '../provider-auth.interface';

/**
 * OneDrive OAuth 認証実装
 */
@Injectable()
export class OnedriveAuthService implements ProviderAuthService {
  private readonly onedriveUserInfoUrl =
    'https://graph.microsoft.com/v1.0/me';

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly oauthAccountService: OAuthAccountService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * OneDrive OAuth コールバック処理
   */
  async handleCallback(code: string, state: string): Promise<UserInfoDto> {
    const verifierKey = `oauth:verifier:onedrive:${state}`;
    const verifier = await this.redis.get(verifierKey);

    if (!verifier) {
      throw new BadRequestException('Code verifier not found');
    }

    try {
      const baseRedirectUri = this.configService.get<string>(
        'ONEDRIVE_REDIRECT_URI',
      );
      if (!baseRedirectUri) {
        throw new InternalServerErrorException(
          'OneDrive OAuth configuration missing',
        );
      }

      const tokenData = await this.tokenService.exchangeCodeForToken(
        code,
        verifier,
        baseRedirectUri,
        ProviderType.ONEDRIVE,
      );

      const onedriveUser = await this.fetchUserInfo(tokenData.access_token);

      const user = await this.userService.upsertUser(onedriveUser);

      await this.oauthAccountService.upsertOAuthAccount(
        user.id,
        onedriveUser,
        tokenData,
      );

      return {
        id: String(user.id),
        email: user.email,
        name: user.name || undefined,
        picture_url: user.picture_url,
        last_login: user.last_login,
        drives: [], // ドライブ情報は別途 UserService から取得
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('[ONEDRIVE_AUTH] Callback error', error as Error);
      throw new InternalServerErrorException(
        'Failed to process OneDrive OAuth callback',
      );
    }
  }

  /**
   * OneDrive ユーザー情報を取得
   * Microsoft Graph API のレスポンスを GoogleUserInfoDto 形式に変換
   */
  async fetchUserInfo(accessToken: string): Promise<GoogleUserInfoDto> {
    try {
      const response = await axios.get(this.onedriveUserInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Microsoft Graph のレスポンスを変換
      // TODO: 詳細なマッピング処理を追加
      const onedriveUser = response.data;

      return {
        id: onedriveUser.id,
        email: onedriveUser.userPrincipalName || onedriveUser.mail,
        name: onedriveUser.displayName,
        picture: onedriveUser.mobilePhone || undefined,
      } as GoogleUserInfoDto;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          '[ONEDRIVE_AUTH] User info fetch error',
          error.response?.data,
        );
        throw new InternalServerErrorException(
          'Failed to fetch OneDrive user info',
        );
      }
      throw error;
    }
  }
}
