import {
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { users, authIdentities, driveConnections } from '../../database';
import { and, eq } from 'drizzle-orm';
import { UserInfoDto, GoogleUserInfoDto, DriveConnectionDto } from '../dto';
import { LoggerService } from 'src/common/logger/logger.service';
import { ProviderType } from 'src/drive/constants';
import { TokenService } from './token.service';
import { EncryptionService } from 'src/common/encryption/encryption.service';

/**
 * ユーザー管理サービス
 * (実質リポジトリ層)
 */
@Injectable()
export class UserService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly tokenService: TokenService,
    private readonly Logger: LoggerService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * ユーザー情報を取得
   * 接続済みドライブ情報も含める
   */
  async getUserInfo(userId: bigint): Promise<UserInfoDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 接続済みドライブ情報を取得
    const driveConns = await this.db.query.driveConnections.findMany({
      where: and(
        eq(driveConnections.user_id, userId),
        eq(driveConnections.is_active, true),
      ),
    });

    // DriveConnectionDto に変換
    const drives: DriveConnectionDto[] = driveConns.map((conn) => ({
      id: String(conn.id),
      provider: conn.provider_name,
      account: conn.provider_account_email || conn.provider_account_id,
      status: this.getConnectionStatus(conn),
      connected_at: conn.created_at,
    }));

    return {
      id: String(user.id),
      email: user.email,
      name: user.name || undefined,
      picture_url: user.picture_url,
      last_login: user.last_login,
      drives,
    };
  }

  /**
   * Drive接続の状態を判定
   */
  private getConnectionStatus(
    conn: any,
  ): 'connected' | 'expired' | 'revoked' | 'error' {
    // is_active がfalseの場合は revoked
    if (!conn.is_active) {
      return 'revoked';
    }

    // access_token が無い場合は revoked
    if (!conn.access_token_encrypted) {
      return 'revoked';
    }

    // トークンが期限切れの場合は expired
    if (
      conn.access_token_expires_at &&
      new Date(conn.access_token_expires_at) < new Date()
    ) {
      return 'expired';
    }

    // refresh_token がない場合は不安定
    if (!conn.refresh_token_encrypted && conn.access_token_expires_at) {
      return 'expired';
    }

    return 'connected';
  }

  /**
   * ユーザーをデータベースに登録または更新
   */
  async upsertUser(googleUser: GoogleUserInfoDto) {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, googleUser.email),
    });

    const now = new Date();

    if (existingUser) {
      await this.db
        .update(users)
        .set({
          name: googleUser.name,
          picture_url: googleUser.picture,
          last_login: now,
          updated_at: now,
        })
        .where(eq(users.id, existingUser.id));

      return { ...existingUser, last_login: now };
    }

    const newUsers = await this.db
      .insert(users)
      .values({
        email: googleUser.email,
        name: googleUser.name,
        picture_url: googleUser.picture,
        is_active: true,
        last_login: now,
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!newUsers[0]) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return newUsers[0];
  }
  
  /**
   * ログイン用 Auth Identity を作成・更新
   */
  async upsertAuthIdentity(
    userId: bigint,
    userInfo: any,
    provider: string = ProviderType.GOOGLE
  ) {
    const now = new Date();
    this.Logger.debug(`${provider} login identity:`, userInfo);

    const existingIdentity = await this.db.query.authIdentities.findFirst({
      where: and(
        eq(authIdentities.user_id, userId),
        eq(authIdentities.provider_name, provider)
      ),
    });

    if (existingIdentity) {
      await this.db
        .update(authIdentities)
        .set({
          provider_user_id: userInfo.sub,
          provider_email: userInfo.email,
          updated_at: now,
        })
        .where(eq(authIdentities.id, existingIdentity.id));
    } else {
      await this.db.insert(authIdentities).values({
        user_id: userId,
        provider_name: provider,
        provider_user_id: userInfo.sub,
        provider_email: userInfo.email,
        is_primary: true,
        created_at: now,
        updated_at: now,
      });
    }
  }

  /**
   * Drive 接続情報を保存（トークン暗号化）
   */
  async upsertDriveConnection(
    userId: bigint,
    userInfo: any,
    tokenData: any,
    provider: string = ProviderType.GOOGLE
  ) {
    const accessTokenExpiresAt = this.tokenService.calculateTokenExpiration(
      tokenData.expires_in
    );
    const refreshTokenExpiresAt = tokenData.refresh_token
      ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      : null;

    const now = new Date();
    this.Logger.debug(`${provider} drive connection:`, userInfo);

    // プロバイダー側のアカウントID（Google の場合はメールアドレス）
    const providerAccountId = userInfo.email || userInfo.sub;

    // トークンを暗号化
    const accessTokenEncrypted = this.encryptionService.encrypt(
      tokenData.access_token
    );
    const refreshTokenEncrypted = tokenData.refresh_token
      ? this.encryptionService.encrypt(tokenData.refresh_token)
      : null;

    const existingConnection = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.user_id, userId),
        eq(driveConnections.provider_name, provider),
        eq(driveConnections.provider_account_id, providerAccountId)
      ),
    });

    if (existingConnection) {
      await this.db
        .update(driveConnections)
        .set({
          access_token_encrypted: accessTokenEncrypted,
          refresh_token_encrypted: refreshTokenEncrypted || existingConnection.refresh_token_encrypted,
          access_token_expires_at: accessTokenExpiresAt,
          refresh_token_expires_at: refreshTokenExpiresAt,
          is_active: true,
          last_accessed_at: now,
          updated_at: now,
        })
        .where(eq(driveConnections.id, existingConnection.id));
    } else {
      await this.db.insert(driveConnections).values({
        user_id: userId,
        provider_name: provider,
        provider_account_id: providerAccountId,
        provider_account_email: userInfo.email,
        access_token_encrypted: accessTokenEncrypted,
        refresh_token_encrypted: refreshTokenEncrypted,
        scopes: JSON.stringify(tokenData.scopes || ['drive.readonly']),
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }
  }

  /**
   * ログアウト処理（全Driveトークンを無効化）
   */
  async logout(userId: bigint): Promise<void> {
    const connections = await this.db.query.driveConnections.findMany({
      where: eq(driveConnections.user_id, userId),
    });

    for (const conn of connections) {
      if (conn.access_token_encrypted) {
        try {
          const accessToken = this.encryptionService.decrypt(
            conn.access_token_encrypted
          );
          await this.tokenService.revokeToken(accessToken, conn.provider_name);
        } catch (error) {
          this.Logger.warn(`Failed to revoke token for ${conn.provider_name}:`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }
}

