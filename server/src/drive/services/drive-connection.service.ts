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
}
