import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import { oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import { DriveConnectionDto } from '../../auth/dto';
import { TokenService } from '../../auth/services/token.service';
import Redis from 'ioredis';
import { ProviderType } from '../constants';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class DriveConnectionService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: Database,
    @Inject('REDIS_CLIENT') private redis: Redis,
    private configService: ConfigService,
    private tokenService: TokenService,
    private readonly logger: LoggerService,
  ) {}

  // 接続済みドライブ一覧を取得
  // TODO: statusの確認方法を見直し
  async listConnections(userId: bigint): Promise<DriveConnectionDto[]> {
    const conns = await this.db.query.oauthAccounts.findMany({
      where: eq(oauthAccounts.user_id, userId),
    });
    return conns.map((c) => ({
      id: String(c.id),
      provider: c.provider_name,
      account: c.provider_email || '',
      status: c.access_token ? 'connected' : 'revoked',
      connected_at: c.created_at,
    }));
  }

  // プロバイダー別 OAuth 認可開始
  async initiateProviderConnection(userId: bigint, provider: string = ProviderType.GOOGLE) {
    return this.tokenService.generateAuthorizationUrl(provider, userId);
  }

  async deleteConnection(userId: bigint, connectionId: bigint): Promise<void> {
    const c = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.id, connectionId),
        eq(oauthAccounts.user_id, userId),
      ),
    });
    if (!c) throw new UnauthorizedException();
    if (c.access_token)
      try {
        await this.tokenService.revokeToken(c.access_token);
      } catch (e) {
        this.logger.error('Failed to revoke token', e);
      }
  }





  async handleProviderCallback(
    provider: string,
    code: string,
    state: string,
  ): Promise<DriveConnectionDto> {
    if (provider === ProviderType.GOOGLE) {
      return this.handleGoogleCallback(code, state);
    } else if (provider === ProviderType.ONEDRIVE) {
      return this.handleOnedriveCallback(code, state);
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  private async handleGoogleCallback(
    code: string,
    state: string,
  ): Promise<DriveConnectionDto> {
    const userIdStr = await this.redis.get(`oauth:userid:google:${state}`);
    const verifier = await this.redis.get(`oauth:verifier:google:${state}`);
    if (!userIdStr || !verifier) throw new BadRequestException();
    const userId = BigInt(userIdStr);
    await this.redis.del(`oauth:state:google:${state}`);
    await this.redis.del(`oauth:verifier:google:${state}`);
    await this.redis.del(`oauth:userid:google:${state}`);
    const redirectUri = this.configService.get('GOOGLE_REDIRECT_URI');
    const tokenData = await this.tokenService.exchangeCodeForToken(
      code,
      verifier,
      redirectUri,
      ProviderType.GOOGLE,
    );
    const googleUser = await this.fetchGoogleUserInfo(tokenData.access_token);
    const now = new Date();
    const existing = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, ProviderType.GOOGLE),
      ),
    });
    if (existing) {
      await this.db
        .update(oauthAccounts)
        .set({
          provider_email: googleUser.email,
          access_token: tokenData.access_token,
          access_token_expires_at: this.tokenService.calculateTokenExpiration(
            tokenData.expires_in,
          ),
          refresh_token: tokenData.refresh_token || existing.refresh_token,
          updated_at: now,
        })
        .where(eq(oauthAccounts.id, existing.id));
      return {
        id: String(existing.id),
        provider: ProviderType.GOOGLE,
        account: googleUser.email,
        status: 'connected',
        connected_at: existing.created_at,
      };
    }
    const [inserted] = await this.db
      .insert(oauthAccounts)
      .values({
        user_id: userId,
        provider_name: ProviderType.GOOGLE,
        provider_user_id: googleUser.sub,
        provider_email: googleUser.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        access_token_expires_at: this.tokenService.calculateTokenExpiration(
          tokenData.expires_in,
        ),
        created_at: now,
        updated_at: now,
      })
      .returning();
    return {
      id: String(inserted.id),
      provider: ProviderType.GOOGLE,
      account: googleUser.email,
      status: 'connected',
      connected_at: now,
    };
  }

  private async handleOnedriveCallback(
    code: string,
    state: string,
  ): Promise<DriveConnectionDto> {
    const userIdStr = await this.redis.get(`oauth:userid:onedrive:${state}`);
    const verifier = await this.redis.get(`oauth:verifier:onedrive:${state}`);
    if (!userIdStr || !verifier) throw new BadRequestException();
    const userId = BigInt(userIdStr);
    await this.redis.del(`oauth:state:onedrive:${state}`);
    await this.redis.del(`oauth:verifier:onedrive:${state}`);
    await this.redis.del(`oauth:userid:onedrive:${state}`);
    const redirectUri = this.configService.get('ONEDRIVE_REDIRECT_URI');
    const tokenData = await this.tokenService.exchangeCodeForToken(
      code,
      verifier,
      redirectUri,
      ProviderType.ONEDRIVE,
    );
    const onedriveUser = await this.fetchOnedriveUserInfo(tokenData.access_token);
    const now = new Date();
    const existing = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, ProviderType.ONEDRIVE),
      ),
    });
    if (existing) {
      await this.db
        .update(oauthAccounts)
        .set({
          provider_email: onedriveUser.userPrincipalName,
          access_token: tokenData.access_token,
          access_token_expires_at: this.tokenService.calculateTokenExpiration(
            tokenData.expires_in,
          ),
          refresh_token: tokenData.refresh_token || existing.refresh_token,
          updated_at: now,
        })
        .where(eq(oauthAccounts.id, existing.id));
      return {
        id: String(existing.id),
        provider: ProviderType.ONEDRIVE,
        account: onedriveUser.userPrincipalName,
        status: 'connected',
        connected_at: existing.created_at,
      };
    }
    const [inserted] = await this.db
      .insert(oauthAccounts)
      .values({
        user_id: userId,
        provider_name: ProviderType.ONEDRIVE,
        provider_user_id: onedriveUser.id,
        provider_email: onedriveUser.userPrincipalName,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        access_token_expires_at: this.tokenService.calculateTokenExpiration(
          tokenData.expires_in,
        ),
        created_at: now,
        updated_at: now,
      })
      .returning();
    return {
      id: String(inserted.id),
      provider: ProviderType.ONEDRIVE,
      account: onedriveUser.userPrincipalName,
      status: 'connected',
      connected_at: now,
    };
  }

  /**
   * Google ユーザー情報を取得
   */
  private async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) throw new Error('Failed to fetch Google user info');
    return response.json();
  }

  /**
   * OneDrive ユーザー情報を取得
   */
  private async fetchOnedriveUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) throw new Error('Failed to fetch OneDrive user info');
    return response.json();
  }
}
