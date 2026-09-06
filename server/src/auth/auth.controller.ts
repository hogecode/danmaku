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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Express, Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { OAuthAccountService } from './services/auth-account.service';
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

/**
 * Google OAuth 認証コントローラー
 */
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly oauthAccountService: OAuthAccountService,
    private readonly configService: ConfigService,
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
   * - Web版: 302リダイレクト
   * - Flutter版: ディープリンクにリダイレクト
   */
  @Get('callback')
  async callback(
    @Query() query: CallbackQueryDto,
    @Session() session: Express.Session,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    // エラーパラメータをチェック
    if (query.error) {
      const errorMsg = `Authorization failed: ${query.error_description || query.error}`;
      console.error('[AUTH] OAuth error:', errorMsg);

      throw new BadRequestException(errorMsg);
    }

    // コードとstateの存在をチェック
    if (!query.code || !query.state) {
      const errorMsg = 'Missing code or state parameter';
      console.error('[AUTH] Missing OAuth parameters:', errorMsg);

      throw new BadRequestException(errorMsg);
    }

    try {
      // コールバック処理
      const isFlutterClient = this._isFlutterClient(request);
      const userInfo = await this.authService.handleGoogleCallback(
        query.code,
        query.state,
        isFlutterClient,
      );

      // セッションにユーザーID（string）を保存
      (session as any).userId = userInfo.id;

      // Flutter版の場合はディープリンクにリダイレクト
      // JWT アクセストークンを生成
      if (isFlutterClient) {
        console.log('[AUTH] Redirecting Flutter client to deep link');
        const tokenService = (this.authService as any).tokenService;
        const accessToken = tokenService.generateAccessToken(BigInt(userInfo.id));
        const userData = JSON.stringify(userInfo);
        const deepLinkUrl = `danmaku://auth/callback?user=${encodeURIComponent(userData)}&token=${encodeURIComponent(accessToken)}`;
        console.log('[AUTH] Deep link URL (full):', deepLinkUrl);
        console.log('[AUTH] Access token generated:', accessToken.substring(0, 50) + '...');
        return response.redirect(302, deepLinkUrl);
      }

      // Web版の場合はリダイレクト
      console.log('[AUTH] Redirecting Web client to frontend home');
      return response.redirect(302, `${this.configService.get('FRONTEND_URL')}/home`);
    } catch (error) {
      console.error('[AUTH] Callback error:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';

      throw new BadRequestException(errorMsg);
    }
  }

  /**
   * Flutter クライアントかどうかを判定
   * 
   * ?client=mobile クエリパラメータをチェック（コールバック時）
   * OAuth認可リクエストでは常にこのパラメータが付与される
   */
  private _isFlutterClient(request: Request): boolean {
    const query = request.query as any;
    const isFlutter = query?.client === 'mobile';
    
    if (isFlutter) {
      console.log('[AUTH] Detected Flutter client via ?client=mobile');
    } else {
      console.log('[AUTH] Detected Web client');
    }

    return isFlutter;
  }

  /**
   * GET /api/auth/me - ユーザー情報取得
   */
  @Get('me')
  @UseGuards(AuthGuard)
  async getUserInfo(
    @Session() session: Express.Session,
  ): Promise<UserInfoDto> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    // 文字列から bigint に変換してサービスに渡す
    return await this.userService.getUserInfo(BigInt(userId));
  }

  /**
   * POST /api/auth/refresh - トークン更新
   */
  @Post('refresh')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async refreshToken(
    @Session() session: Express.Session,
  ): Promise<RefreshTokenResponseDto> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    // 文字列から bigint に変換してサービスに渡す
    return await this.oauthAccountService.refreshToken(BigInt(userId));
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

    // 文字列から bigint に変換してサービスに渡す
    await this.oauthAccountService.logout(BigInt(userId));

    // セッションを破棄（Express Session API）
    (session as any).destroy?.(() => {});

    return { message: 'Logged out successfully' };
  }
}
