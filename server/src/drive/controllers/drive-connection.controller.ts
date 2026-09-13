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
  Req,
  Res,
  Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Express } from 'express';
import Redis from 'ioredis';
import { AuthGuard } from '../../auth/guards';
import { DriveConnectionService } from '../services/drive-connection.service';
import { DriveConnectionOAuthService } from '../services/drive-connection-oauth.service';
import { DriveConnectionDto } from '../../auth/dto';
import {
  DriveConnectionInitiateResponseDto,
  DriveConnectionCallbackResponseDto,
  DriveConnectionDeleteResponseDto,
} from '../dto';
import { LoggerService } from '../../common/logger/logger.service';
import { AuthService } from '../../auth/services/auth.service';

/**
 * ドライブ接続管理コントローラー
 */
@Controller('api/drive-connections')
@UseGuards(AuthGuard)
export class DriveConnectionController {
  constructor(
    private readonly driveConnectionService: DriveConnectionService,
    private readonly driveConnectionOAuthService: DriveConnectionOAuthService,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  /**
   * GET /api/drive-connections
   * 接続済みドライブリストを取得
   */
  @Get()
  async list(
    @Session() session: Express.Session & { userId?: string },
  ): Promise<DriveConnectionDto[] > {
    if (!session.userId) throw new BadRequestException('User ID not found');
    const connections = await this.driveConnectionService.listConnections(BigInt(session.userId));
    return connections;
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
  ): Promise<DriveConnectionInitiateResponseDto> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    const result = await this.driveConnectionOAuthService.generateDriveAuthorizationUrl(BigInt(session.userId), provider);
    return {
      authorize_url: result.authorize_url,
      state: result.state,
      expires_in: result.expires_in,
    };
  }

  /**
   * GET /api/drive-connections/:provider/callback
   * Drive接続 callback
   * 
   * セッションを保存し、モバイルクライアントにはDeepLinkでリダイレクト、
   * Webクライアントはフロントエンドにリダイレクトする
   */
  @Get(':provider/callback')
  async handleConnectionCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Session() session: Express.Session,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    // session.userId がない場合は、state から userid を取得して設定
    // （状態確認処理で既に userId を検証済み）
    let userId = (session as any).userId;

    if (!code || code.trim().length === 0) {
      throw new BadRequestException('code parameter is required');
    }

    if (!state || state.trim().length === 0) {
      throw new BadRequestException('state parameter is required');
    }

    try {
      // userId が必須なので、ここで確認
      if (!userId) {
        throw new BadRequestException('User ID not found in session or state');
      }

      // Drive接続コールバックを処理
      const result = await this.driveConnectionOAuthService.handleDriveConnectionCallback(
        provider,
        code,
        state,
        BigInt(userId),
      );

      this.logger.debug(
        `[DriveConnection] Drive connection successful (${provider})`,
        {
          connectionId: result.connectionId,
          userId,
        },
      );

      // クライアントタイプを検出
      const clientType = this.authService.detectClientType(request);

      // session.id は Express.Session では必須なため、non-null assertion を使用
      const sessionId = session.id!;

      // ディープリンク URL またはリダイレクト URL を生成（サービス層で処理）
      const redirectResponse = this.driveConnectionOAuthService.createDriveConnectionRedirectURL(
        result,
        provider,
        clientType,
        sessionId,
      );

      // ディープリンク URL またはリダイレクト URL でリダイレクト
      return response.redirect(302, redirectResponse.url);
    } catch (error) {
      this.logger.error(
        `[DriveConnection] Callback error (${provider})`,
        error as Error,
      );
      const errorMsg =
        error instanceof Error ? error.message : 'Connection failed';
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
  ): Promise<DriveConnectionDeleteResponseDto> {
    if (!session.userId) throw new BadRequestException('User ID not found');
    await this.driveConnectionService.deleteConnection(BigInt(session.userId), BigInt(connectionId));
    return { message: 'Connection deleted successfully' };
  }
}
