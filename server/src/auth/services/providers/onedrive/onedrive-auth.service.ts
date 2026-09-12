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
    private readonly logger: LoggerService,
  ) {}

  /**
   * OneDrive OAuth コールバック処理
   */
  async handleCallback(code: string, state: string): Promise<UserInfoDto> {
    const verifierKey = `oauth:verifier:onedrive:${state}`;
    const stateKey = `oauth:state:onedrive:${state}`;

    // ✅ デバッグ情報：state と verifier の確認
    const verifier = await this.redis.get(verifierKey);
    const stateExists = await this.redis.exists(stateKey);

    this.logger.debug('[ONEDRIVE_AUTH] Callback state check', {
      state,
      verifierKey,
      verifierExists: !!verifier,
      stateExists: stateExists === 1,
    });

    if (!verifier) {
      this.logger.error('[ONEDRIVE_AUTH] Code verifier not found for state', {
        state,
        verifierKey,
      });
      throw new BadRequestException('Code verifier not found');
    }

    if (stateExists !== 1) {
      this.logger.error('[ONEDRIVE_AUTH] State validation failed', {
        state,
        stateKey,
      });
      throw new BadRequestException('Invalid or expired state');
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

      // ログイン用 Auth Identity を作成
      await this.userService.upsertAuthIdentity(
        user.id,
        onedriveUser,
        ProviderType.ONEDRIVE,
      );

      // Drive接続情報を保存（トークン暗号化）
      await this.userService.upsertDriveConnection(
        user.id,
        onedriveUser,
        tokenData,
        ProviderType.ONEDRIVE,
      );

      // 接続済みドライブ情報を取得
      const userInfo = await this.userService.getUserInfo(user.id);

      // ✅ OAuth フロー完了後、Redis キーを削除（再利用防止）
      await Promise.all([
        this.redis.del(verifierKey),
        this.redis.del(stateKey),
      ]);

      this.logger.info('[ONEDRIVE_AUTH] Callback success', {
        userId: user.id,
        state,
      });

      return userInfo;
    } catch (error) {
      // ✅ エラー時も Redis キーを削除
      await Promise.all([
        this.redis.del(verifierKey),
        this.redis.del(stateKey),
      ]);

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
