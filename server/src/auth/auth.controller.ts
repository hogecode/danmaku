import {
  Controller,
  Post,
  Get,
  Query,
  Session,
  UseGuards,
  Redirect,
  Req,
  Res,
  BadRequestException,
  HttpCode,
  Param,
} from '@nestjs/common';
import type { Express, Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { TokenService } from './services/token.service';
import { ConfigService } from '@nestjs/config';
import { RateLimitGuard, AuthGuard } from './guards';
import {
  LoginResponseDto,
  CallbackQueryDto,
  UserInfoDto,
} from './dto';
import { LoggerService } from '../common/logger/logger.service';
import { ProviderType } from '../drive/constants';

/**
 * Google OAuth 認証コントローラー
 */
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /api/auth/login/:provider - プロバイダー別ログイン開始
   *
   * 認可URLを生成して返す
   */
  @Post('login/:provider')
  @UseGuards(RateLimitGuard)
  @HttpCode(200)
  async loginWithProvider(
    @Param('provider') provider: ProviderType,
  ): Promise<LoginResponseDto> {
    return await this.tokenService.generateAuthorizationUrl(provider);
  }

  
  /**
   * GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック
   * 例: GET /api/auth/callback/onedrive
   * 
   * DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする
   */
  @Get('callback/:provider')
  async callbackWithProvider(
    @Param('provider') provider: ProviderType,
    @Query() query: CallbackQueryDto,
    @Session() session: Express.Session,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    if (query.error) {
      const errorMsg = `Authorization failed: ${query.error_description || query.error}`;
      this.logger.error(
        `[AUTH] OAuth error (${provider})`,
        new Error(errorMsg),
      );
      throw new BadRequestException(errorMsg);
    }

    if (!query.code || !query.state) {
      const errorMsg = 'Missing code or state parameter';
      this.logger.error(
        `[AUTH] Missing OAuth parameters (${provider})`,
        new Error(errorMsg),
      );
      throw new BadRequestException(errorMsg);
    }

    try {
      // 認可コードからアクセストークンを取得し、ユーザー情報を取得してDBに保存する
      const userInfo = await this.authService.handleProviderCallback(
        provider,
        query.code,
        query.state,
      );

      (session as any).userId = userInfo.id;

      // クライアントタイプを検出
      const clientType = this.authService.detectClientType(request);

      // コールバック後のレスポンスを準備
      // モバイルの場合はDeep Link を使用し、Webの場合はリダイレクト URL を使用する
      const callbackResponse = this.authService.createRedirectURL(
        userInfo,
        provider,
        clientType,
      );

      // ディープリンク URL またはリダイレクト URL でリダイレクト
      return response.redirect(302, callbackResponse.url);
    } catch (error) {
      this.logger.error(`[AUTH] Callback error (${provider})`, error as Error);
      const errorMsg =
        error instanceof Error ? error.message : 'Authentication failed';
      throw new BadRequestException(errorMsg);
    }
  }


  /**
   * GET /api/auth/me - ユーザー情報取得
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getUserInfo(@Session() session: Express.Session): Promise<UserInfoDto> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    // 接続ドライブ情報も含めて取得
    return await this.userService.getUserInfo(BigInt(userId));
  }

  
  /**
   * POST /api/auth/logout - ログアウト
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(
    @Session() session: Express.Session,
  ): Promise<{ message: string }> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    // 全てのログインサービスからログアウト
    // TODO: ログアウトロジックを見直す
    // await this.userService.logout(BigInt(userId));

    // セッションを破棄（Express Session API）
    (session as any).destroy?.(() => {});

    return { message: 'Logged out successfully' };
  }
}
