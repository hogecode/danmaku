import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { DATABASE_CONNECTION } from '../database/database.module';
import type {Database} from '../database/database.module';
import { LoggerService } from '../common/logger/logger.service';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database?: {
    status: 'connected' | 'disconnected';
  };
  redis?: {
    status: 'connected' | 'disconnected';
  };
  message?: string;
}

@Controller('api/health')
export class HealthController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async health(): Promise<HealthResponse> {
    const timestamp = new Date().toISOString();
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
    let redisStatus: 'connected' | 'disconnected' = 'disconnected';
    let hasError = false;
    let errorMessage = '';

    // ✅ Check database connection
    try {
      await this.db.execute(sql`SELECT 1`);
      databaseStatus = 'connected';
      this.logger.debug('Database health check passed');
    } catch (error) {
      databaseStatus = 'disconnected';
      hasError = true;
      errorMessage = error instanceof Error ? error.message : 'Database connection failed';
      this.logger.error('Database health check failed', error);
    }

    // ✅ Check Redis connection
    try {
      await this.redisClient.ping();
      redisStatus = 'connected';
      this.logger.debug('Redis health check passed');
    } catch (error) {
      redisStatus = 'disconnected';
      hasError = true;
      errorMessage = error instanceof Error ? error.message : 'Redis connection failed';
      this.logger.error('Redis health check failed', error);
    }

    return {
      status: hasError ? 'error' : 'ok',
      timestamp,
      database: {
        status: databaseStatus,
      },
      redis: {
        status: redisStatus,
      },
      ...(hasError && { message: errorMessage }),
    };
  }
}
