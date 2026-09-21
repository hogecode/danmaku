import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import type {Database} from '../database/database.module';
import { LoggerService } from '../common/logger/logger.service';

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database?: {
    status: 'connected' | 'disconnected';
  };
  message?: string;
}

@Controller('api/health')
export class HealthController {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: Database,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  async health(): Promise<HealthResponse> {
    const timestamp = new Date().toISOString();

    try {
      // Check database connection by executing a simple query
      await this.db.execute(sql`SELECT 1`);

      this.logger.debug(`Health check passed`);

      return {
        status: 'ok',
        timestamp,
        database: {
          status: 'connected',
        },
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'error',
        timestamp,
        database: {
          status: 'disconnected',
        },
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
