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
      this.logger.error('[AUTH] OAuth error', new Error(errorMsg));

      throw new BadRequestException(errorMsg);
    }

    // コードとstateの存在をチェック
    if (!query.code || !query.state) {
      const errorMsg = 'Missing code or state parameter';
      this.logger.error('[AUTH] Missing OAuth parameters', new Error(errorMsg));

      throw new BadRequestException(errorMsg);
    }

    try {
      // コールバック処理
      const isMobileClient = this._isMobileClient(request);
      const userInfo = await this.authService.handleGoogleCallback(
        query.code,
        query.state,
      );

      // セッションにユーザーID（string）を保存
      (session as any).userId = userInfo.id;

      // モバイル版の場合はディープリンクにリダイレクト
      // JWT アクセストークンを生成
      if (isMobileClient) {
        this.logger.debug('[AUTH] Redirecting Mobile client to deep link');
        const tokenService = (this.authService as any).tokenService;
        const accessToken = tokenService.generateAccessToken(BigInt(userInfo.id));
        const userData = JSON.stringify(userInfo);
        const deepLinkUrl = `danmaku://auth/callback?user=${encodeURIComponent(userData)}&token=${encodeURIComponent(accessToken)}`;
        this.logger.debug('[AUTH] Access token generated', { tokenLength: accessToken.length });
        return response.redirect(302, deepLinkUrl);
      }

      // Web版の場合はリダイレクト
      this.logger.debug('[AUTH] Redirecting Web client to frontend home');
      return response.redirect(302, `${this.configService.get('FRONTEND_URL')}/home`);
    } catch (error) {
      this.logger.error('[AUTH] Callback error', error as Error);
      
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';

      throw new BadRequestException(errorMsg);
    }
  }

  /**
   * クライアントタイプを判定
   * 
   * ⚠️ IMPORTANT: Google OAuth の redirect_uri_mismatch エラーを回避するため、
   * クエリパラメータではなく Authorization ヘッダー (X-Client-Type) で判定
   * 
   * クライアント判定の優先順位:
   * 1. X-Client-Type ヘッダー (クライアントが明示的に指定した場合)
   * 2. User-Agent ヘッダー (モバイルブラウザの場合)
   * 3. デフォルト: Web クライアント
   */
  private _isMobileClient(request: Request): boolean {
    // 1. X-Client-Type ヘッダーをチェック（認証サービスから指定）
    const clientType = request.headers['x-client-type'] as string | undefined;
    if (clientType === 'flutter' || clientType === 'desktop' || clientType === 'mobile') {
      this.logger.debug('[AUTH] Detected Mobile client via X-Client-Type header'); // 'flutter', 'desktop', 'mobile' are considered mobile clients
      return true;
    }

    // 2. User-Agent からモバイルブラウザを検出
    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    const isMobileUserAgent =
      /mobile|android|iphone|ipad|windows phone|opera mini|blackberry/i.test(userAgent);
    
    if (isMobileUserAgent) {
      this.logger.debug('[AUTH] Detected mobile user agent');
      // モバイルブラウザの場合はモバイルクライアントと判定
      return true;
    }

    // 3. デフォルト: Web クライアント
    this.logger.debug('[AUTH] Detected Web client (default)');
    return false;
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

   /**
    * POST /api/auth/video-token - 動画ストリーミング用トークン生成
    * 
    * 目的: モバイルアプリでの動画URL認証
    * - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成
    * - 有効期限: 15分（デフォルト）
    * 
    * @example
    * POST /api/auth/video-token
    * Authorization: Bearer {access_token}
    * 
    * Response: { token: "eyJhbGciOiJIUzI1NiIs..." }
    */
   @Post('video-token')
   @UseGuards(AuthGuard)
   @HttpCode(200)
   async generateVideoToken(
     @Session() session: Express.Session,
   ): Promise<{ token: string }> {
     const userId = (session as any).userId;
     if (!userId) {
       throw new BadRequestException('User ID not found in session');
     }

     try {
       this.logger.info(`🎬 Generating video token for userId: ${userId}`);
       
       // JWT トークンを生成（有効期限: 15分）
       const token = this.tokenService.generateAccessToken(BigInt(userId));
       
       this.logger.info(`✅ Video token generated (length: ${token.length})`);
       return { token };
     } catch (error) {
       this.logger.error(`❌ Failed to generate video token: ${(error as Error).message}`);
       throw error;
     }
   }

}
