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
import { OAuthAccountService } from './services/oauth-account.service';
import { TokenService } from './services/token.service';
import { ConfigService } from '@nestjs/config';
import { RateLimitGuard, AuthGuard } from './guards';
import {
  LoginRequestDto,
  LoginResponseDto,
  CallbackQueryDto,
  CallbackResponseDto,
  UserInfoDto,
  RefreshTokenResponseDto,
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
    private readonly oauthAccountService: OAuthAccountService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /api/auth/login/:provider - プロバイダー別ログイン開始
   * 例: POST /api/auth/login/onedrive
   *
   * 認可URLを生成して返す
   */
  @Post('login/:provider')
  @UseGuards(RateLimitGuard)
  @HttpCode(200)
  async loginWithProvider(
    @Param('provider') provider: string,
  ): Promise<LoginResponseDto> {
    return await this.authService.initializeLogin(provider);
  }

  /**
   * GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック
   * 例: GET /api/auth/callback/onedrive
   */
  @Get('callback/:provider')
  async callbackWithProvider(
    @Param('provider') provider: string,
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
      const userInfo = await this.authService.handleProviderCallback(
        provider,
        query.code,
        query.state,
      );

      (session as any).userId = userInfo.id;

      // クライアントタイプを検出
      const clientType = this.authService.detectClientType(request);

      // コールバック後のレスポンスを準備
      const callbackResponse = this.authService.prepareCallbackResponse(
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
    await this.oauthAccountService.logout(BigInt(userId));

    // セッションを破棄（Express Session API）
    (session as any).destroy?.(() => {});

    return { message: 'Logged out successfully' };
  }
}
