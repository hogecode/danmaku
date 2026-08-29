import {
  Controller,
  Post,
  Get,
  Query,
  Session,
  UseGuards,
  Redirect,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { OAuthAccountService } from './services/auth-account.service';
import { RateLimitGuard, AuthGuard } from './guards';
import {
  LoginRequestDto,
  LoginResponseDto,
  CallbackQueryDto,
  UserInfoDto,
  RefreshTokenResponseDto,
} from './dto';
import { Express } from 'express';

/**
 * Google OAuth 認証コントローラー
 */
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly oauthAccountService: OAuthAccountService,
  ) {}

  /**
   * POST /api/auth/login - ログイン開始
   */
  @Post('login')
  @UseGuards(RateLimitGuard)
  @HttpCode(200)
  async login(): Promise<LoginResponseDto> {
    // 認可URL と state を生成して返す
    return await this.authService.initializeLogin();
  }

  /**
   * GET /api/auth/callback - OAuth コールバック
   * Google OAuth 認証後にリダイレクトされるエンドポイント
   */
  @Get('callback')
  @Redirect()
  async callback(
    @Query() query: CallbackQueryDto,
    @Session() session: Express.Session & { userId?: bigint },
  ) {
    // エラーパラメータをチェック
    if (query.error) {
      throw new BadRequestException(
        `Authorization failed: ${query.error_description || query.error}`,
      );
    }

    // コードとstateの存在をチェック
    if (!query.code || !query.state) {
      throw new BadRequestException('Missing code or state parameter');
    }

    try {
      // コールバック処理
      const userInfo = await this.authService.handleGoogleCallback(
        query.code,
        query.state,
      );

      // セッションにユーザーIDを保存
      session.userId = userInfo.id;

      // リダイレクト先
      return {
        url: '/home',
        statusCode: 302,
      };
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  }

  /**
   * GET /api/auth/me - ユーザー情報取得
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getUserInfo(
    @Session() session: Express.Session & { userId?: bigint },
  ): Promise<UserInfoDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return await this.userService.getUserInfo(session.userId);
  }

  /**
   * POST /api/auth/refresh - トークン更新
   */
  @Post('refresh')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async refreshToken(
    @Session() session: Express.Session & { userId?: bigint },
  ): Promise<RefreshTokenResponseDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return await this.oauthAccountService.refreshToken(session.userId);
  }

  /**
   * POST /api/auth/logout - ログアウト
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(
    @Session() session: Express.Session & { userId?: bigint },
  ): Promise<{ message: string }> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    await this.oauthAccountService.logout(session.userId);

    // セッションを破棄（Express Session API）
    (session as any).destroy?.(() => {});

    return { message: 'Logged out successfully' };
  }
}
