import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import { GoogleTokenDto } from '../dto';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { ProviderType } from '../../drive/constants';
import { GoogleTokenService } from './providers/google/google-token.service';
import { OnedriveTokenService } from './providers/onedrive/onedrive-token.service';
import { EncryptionService } from '../../common/encryption/encryption.service';

/**
 * マルチプロバイダー OAuth トークン管理（共通＆ルーティング層）
 */
@Injectable()
export class TokenService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly configService: ConfigService,
    private readonly googleTokenService: GoogleTokenService,
    private readonly onedriveTokenService: OnedriveTokenService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // OAuth プロバイダーを抽象化してOAuth 認可URLを生成するメソッド
  async generateAuthorizationUrl(
    provider: string = ProviderType.GOOGLE,
    userId?: bigint,
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    if (provider === ProviderType.GOOGLE) {
      return await this.googleTokenService.generateAuthorizationUrl(userId);
    } else if (provider === ProviderType.ONEDRIVE) {
      return await this.onedriveTokenService.generateAuthorizationUrl(userId);
    }
    throw new InternalServerErrorException(`Unsupported provider: ${provider}`);
  }

  // OAuth プロバイダーを抽象化して認可コードをトークンに交換するメソッド
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
    provider: string = ProviderType.GOOGLE,
  ): Promise<GoogleTokenDto> {
    if (provider === ProviderType.GOOGLE) {
      return await this.googleTokenService.exchangeCodeForToken(
        code,
        codeVerifier,
        redirectUri,
      );
    } else if (provider === ProviderType.ONEDRIVE) {
      return await this.onedriveTokenService.exchangeCodeForToken(
        code,
        codeVerifier,
        redirectUri,
      );
    }
    throw new InternalServerErrorException(`Unsupported provider: ${provider}`);
  }

  // OAuth プロバイダーを抽象化してアクセストークンをリフレッシュするメソッド
  async refreshAccessToken(
    userId: bigint,
    providerName: string,
    connectionId?: bigint,
  ): Promise<GoogleTokenDto> {
    // connectionId がある場合は特定の Drive 接続、ない場合は最初の接続を使う
    let conn;
    if (connectionId) {
      conn = await this.db.query.driveConnections.findFirst({
        where: and(
          eq(driveConnections.id, connectionId),
          eq(driveConnections.user_id, userId),
          eq(driveConnections.provider_name, providerName),
        ),
      });
    } else {
      conn = await this.db.query.driveConnections.findFirst({
        where: and(
          eq(driveConnections.user_id, userId),
          eq(driveConnections.provider_name, providerName),
        ),
      });
    }

    if (!conn || !conn.refresh_token_encrypted) {
      throw new InternalServerErrorException('Refresh token not found');
    }

    const refreshToken = this.encryptionService.decrypt(
      conn.refresh_token_encrypted
    );

    if (providerName === ProviderType.GOOGLE) {
      return await this.googleTokenService.refreshAccessToken(refreshToken);
    } else if (providerName === ProviderType.ONEDRIVE) {
      return await this.onedriveTokenService.refreshAccessToken(refreshToken);
    }

    throw new InternalServerErrorException(
      `Unsupported provider: ${providerName}`,
    );
  }

  // OAuth プロバイダーを抽象化してトークンを取り消すメソッド
  async revokeToken(
    accessToken: string,
    provider: string = ProviderType.GOOGLE,
  ): Promise<void> {
    if (provider === ProviderType.GOOGLE) {
      return await this.googleTokenService.revokeToken(accessToken);
    } else if (provider === ProviderType.ONEDRIVE) {
      return await this.onedriveTokenService.revokeToken(accessToken);
    }
    console.warn(`Cannot revoke token for unsupported provider: ${provider}`);
  }

  // JWT アクセストークンを生成するメソッド
  calculateTokenExpiration(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }

  // JWT アクセストークンの有効期限が近いかどうかを判定するメソッド
  isTokenExpiringSoon(expiresAt: Date): boolean {
    const fiveMinutesInMs = 5 * 60 * 1000;
    const now = new Date();
    return expiresAt.getTime() - now.getTime() < fiveMinutesInMs;
  }

  // 有効なアクセストークンを取得するメソッド（必要に応じてリフレッシュ）
  async getValidAccessToken(
    userId: bigint,
    providerName: string = 'google',
    connectionId?: bigint,
  ): Promise<string> {
    // connectionId がある場合は特定の Drive 接続、ない場合は最初の接続を使う
    let conn;
    if (connectionId) {
      conn = await this.db.query.driveConnections.findFirst({
        where: and(
          eq(driveConnections.id, connectionId),
          eq(driveConnections.user_id, userId),
          eq(driveConnections.provider_name, providerName),
        ),
      });
    } else {
      conn = await this.db.query.driveConnections.findFirst({
        where: and(
          eq(driveConnections.user_id, userId),
          eq(driveConnections.provider_name, providerName),
        ),
      });
    }

    if (!conn?.access_token_encrypted) {
      throw new InternalServerErrorException('Auth info not found');
    }

    // トークンを復号
    const accessToken = this.encryptionService.decrypt(
      conn.access_token_encrypted
    );

    if (
      conn.access_token_expires_at &&
      this.isTokenExpiringSoon(conn.access_token_expires_at)
    ) {
      const newToken = await this.refreshAccessToken(
        userId,
        providerName,
        connectionId
      );
      return newToken.access_token;
    }

    return accessToken;
  }
  
  // JWT アクセストークンを生成するメソッド
  generateAccessToken(userId: bigint): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET not configured');
    }

    const payload = {
      sub: String(userId),
      type: 'access',
    };

    const expiresInValue =
      this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    const expiresIn: StringValue | number = expiresInValue as StringValue | number;
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, secret, options);
  }
}
