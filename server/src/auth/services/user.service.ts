import {
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { users } from '../../database';
import { eq } from 'drizzle-orm';
import { UserInfoDto, GoogleUserInfoDto } from '../dto';

/**
 * ユーザー管理サービス
 */
@Injectable()
export class UserService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Database) {}

  /**
   * ユーザー情報を取得
   */
  async getUserInfo(userId: bigint): Promise<UserInfoDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture_url: user.picture_url,
      oauth_provider: 'google',
      last_login: user.last_login,
    };
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
