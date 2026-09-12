import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import { DriveConnectionDto } from '../../auth/dto';
import { TokenService } from '../../auth/services/token.service';
import { EncryptionService } from '../../common/encryption/encryption.service';
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
    private encryptionService: EncryptionService,
    private readonly logger: LoggerService,
  ) {}

  // 接続済みドライブ一覧を取得
  async listConnections(userId: bigint): Promise<DriveConnectionDto[]> {
    const conns = await this.db.query.driveConnections.findMany({
      where: eq(driveConnections.user_id, userId),
    });
    return conns.map((c) => ({
      id: String(c.id),
      provider: c.provider_name,
      account: c.provider_account_email || '',
      status: c.is_active ? 'connected' : 'revoked',
      connected_at: c.created_at,
    }));
  }

  async deleteConnection(userId: bigint, connectionId: bigint): Promise<void> {
    const c = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.id, connectionId),
        eq(driveConnections.user_id, userId),
      ),
    });
    if (!c) throw new UnauthorizedException();
    
    // トークンが存在する場合は revoke を試みる
    if (c.access_token_encrypted) {
      try {
        // 暗号化されたトークンを復号化
        const decryptedToken = this.encryptionService.decrypt(c.access_token_encrypted);
        // プロバイダー名を指定してトークンを取り消す
        await this.tokenService.revokeToken(decryptedToken, c.provider_name);
      } catch (e) {
        this.logger.error('Failed to revoke token', e);
        // revoke に失敗してもレコード削除は続行
      }
    }
  }
}
