import {
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { users, oauthAccounts } from '../../database';
import { eq } from 'drizzle-orm';
import { UserInfoDto, GoogleUserInfoDto, DriveConnectionDto } from '../dto';

/**
 * ユーザー管理サービス
 */
@Injectable()
export class UserService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Database) {}

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
    const oauthConnections = await this.db.query.oauthAccounts.findMany({
      where: eq(oauthAccounts.user_id, userId),
    });

    // DriveConnectionDto に変換
    const drives: DriveConnectionDto[] = oauthConnections.map((oauth) => ({
      id: String(oauth.id),
      provider: oauth.provider_name,
      account: oauth.provider_email || 'unknown',
      status: this.getConnectionStatus(oauth),
      connected_at: oauth.created_at,
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
   * OAuth接続の状態を判定
   */
  private getConnectionStatus(
    oauth: any,
  ): 'connected' | 'expired' | 'revoked' | 'error' {
    // access_token が無い場合は revoked
    if (!oauth.access_token) {
      return 'revoked';
    }

    // トークンが期限切れの場合は expired
    if (
      oauth.access_token_expires_at &&
      new Date(oauth.access_token_expires_at) < new Date()
    ) {
      return 'expired';
    }

    // refresh_token がない場合は不安定
    if (!oauth.refresh_token && oauth.access_token_expires_at) {
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
}
