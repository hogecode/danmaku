import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Session,
  UseGuards,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards';
import { DriveConnectionService } from '../services/drive-connection.service';
import { DriveConnectionDto } from '../../auth/dto';
import { Express } from 'express';

/**
 * ドライブ接続管理コントローラー
 */
@Controller('api/drives')
@UseGuards(AuthGuard)
export class DriveConnectionController {
  constructor(private readonly driveConnectionService: DriveConnectionService) {}

  /**
   * GET /api/drives
   * 接続済みドライブリストを取得
   */
  @Get()
  async list(
    @Session() session: Express.Session & { userId?: string },
  ): Promise<{ connections: DriveConnectionDto[] }> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    // sessionからユーザーIDを取得し、OAuth接続の一覧をDBから取得
    const connections = await this.driveConnectionService.listConnections(BigInt(session.userId));
    return { connections };
  }

  /**
   * POST /api/drives/:provider/auth
   * プロバイダー別 OAuth 認可開始
   * 
   * 例: POST /api/drives/google/auth
   *     POST /api/drives/onedrive/auth
   */
  @Post(':provider/auth')
  @HttpCode(200)
  async initiateConnection(
    @Param('provider') provider: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    return await this.driveConnectionService.initiateProviderConnection(
      BigInt(session.userId),
      provider,
    );
  }

  /**
   * DELETE /api/drives/:connectionId
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
