import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Session,
  UseGuards,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards';
import { DriveConnectionService } from '../services/drive-connection.service';
import { DriveConnectionOAuthService } from '../services/drive-connection-oauth.service';
import { DriveConnectionDto } from '../../auth/dto';
import { Express } from 'express';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * ドライブ接続管理コントローラー
 */
@Controller('api/drive-connections')
@UseGuards(AuthGuard)
export class DriveConnectionController {
  constructor(
    private readonly driveConnectionService: DriveConnectionService,
    private readonly driveConnectionOAuthService: DriveConnectionOAuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * GET /api/drive-connections
   * 接続済みドライブリストを取得
   */
  @Get()
  async list(
    @Session() session: Express.Session & { userId?: string },
  ): Promise<{ connections: DriveConnectionDto[] }> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    const connections = await this.driveConnectionService.listConnections(BigInt(session.userId));
    return { connections };
  }

  /**
   * POST /api/drive-connections/:provider
   * Drive接続開始（OAuth認可URLを返す）
   */
  @Post(':provider')
  @HttpCode(200)
  async initiateConnection(
    @Param('provider') provider: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    return await this.driveConnectionOAuthService.generateDriveAuthorizationUrl(BigInt(session.userId), provider);
  }

  /**
   * GET /api/drive-connections/:provider/callback
   * Drive接続 callback（JSON返却）
   */
  @Get(':provider/callback')
  @HttpCode(200)
  async handleConnectionCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<{ message: string; connectionId: string }> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    if (!code || code.trim().length === 0) {
      throw new BadRequestException('code parameter is required');
    }

    if (!state || state.trim().length === 0) {
      throw new BadRequestException('state parameter is required');
    }

    try {
      const result = await this.driveConnectionOAuthService.handleDriveConnectionCallback(
      provider,
      code,
      state,
      BigInt(session.userId),
    );

      return result;
    } catch (error) {
      this.logger.error(`[DriveConnection] Callback error (${provider})`, error as Error);
      const errorMsg = error instanceof Error ? error.message : 'Connection failed';
      throw new BadRequestException(errorMsg);
    }
  }

  /**
   * DELETE /api/drive-connections/:connectionId
   * 接続を削除
   */
  @Delete(':connectionId')
  async delete(
    @Param('connectionId') connectionId: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<{ message: string }> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    await this.driveConnectionService.deleteConnection(BigInt(session.userId), BigInt(connectionId));
    return { message: 'Connection deleted successfully' };
  }
}
