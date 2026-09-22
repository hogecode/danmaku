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
  Inject,
} from '@nestjs/common';
import type { Express, Request, Response } from 'express';
import Redis from 'ioredis';
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
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
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
    try {
      const result = await this.tokenService.generateAuthorizationUrl(provider);
      this.logger.debug(`[AUTH] Authorization URL generated for ${provider}`, {
        stateExpiry: result.expires_in,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `[AUTH] Failed to generate authorization URL for ${provider}`,
        error as Error,
        { provider }
      );
      throw new BadRequestException('Failed to initiate login');
    }
  }

  
  /**
   * GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック
   * 例: GET /api/auth/callback/onedrive
   * 
   * DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする
   * モバイルクライアントにはセッション ID を DeepLink で返す
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

      // ✅ Express Session ID を取得
      const sessionId = session.id;
      if (!sessionId) {
        throw new Error('Session ID not found');
      }

      this.logger.info('[AUTH] Before session.save()', {
        sessionId: sessionId.substring(0, 10) + '...',
        userId: userInfo.id,
        sessionHasUserId: !!(session as any).userId,
        sessionKeys: Object.keys(session),
      });

      // ✅ Express Session Store に保存
      await new Promise<void>((resolve, reject) => {
        const sessionWithSave = session as Express.Session & {
          save(callback: (err: Error | null) => void): void;
        };

        this.logger.info('[AUTH] Calling session.save()...');

        sessionWithSave.save((err: Error | null) => {
          if (err) {
            this.logger.error('[AUTH] Failed to save session', err);
            reject(err);
          } else {
            // ✅ callback 直後にセッション状態を再度確認
            this.logger.info('[AUTH] Session save callback success', {
              sessionId: sessionId.substring(0, 10) + '...',
              userId: (session as any).userId,
              sessionHasUserId: !!(session as any).userId,
              sessionKeys: Object.keys(session),
              fullSession: JSON.stringify(session),
            });

            resolve();
          }
        });
      });

       // ✅ 重要：session.touch() でセッション更新フラグを立てる
       // これによって Express Session middleware が確実にセッションを Redis に保存する
        // 🔴 touch() removed - causes userId to disappear
        // (session as any).touch();

      // クライアントタイプを検出
      const clientType = this.authService.detectClientType(request);

      // コールバック後のレスポンスを準備
      // モバイルの場合はDeep Link を使用し、Webの場合はリダイレクト URL を使用する
      const callbackResponse = this.authService.createRedirectURL(
        userInfo,
        provider,
        clientType,
        sessionId, //  sessionId を追加
      );

      // ✅ Express Session ミドルウェアが自動的にセッションクッキーをセット
      // @Redirect() デコレータが { url } を HTTP 302 リダイレクトに変換
      
      this.logger.debug('[AUTH] Redirecting with session', {
        sessionId: sessionId.substring(0, 10) + '...',
        userId: userInfo.id,
        redirectUrl: callbackResponse.url,
        clientType,
      });

      // ✅ @Redirect() デコレータが { url } を HTTP 302 リダイレクトに変換
      // Express Session ミドルウェアがセッションクッキーを自動設定
      // ✅ 明示的にリダイレクト（セッションクッキーは Express Session ミドルウェアが自動セット）
       // 🔴 【重要】レスポンスヘッダを確認（Set-Cookie が存在するか）
      const setCookieHeader = response.getHeader('set-cookie');
      this.logger.info('[AUTH] ✅ Response headers BEFORE redirect', {
        sessionId: sessionId.substring(0, 10) + '...',
        setCookieExists: !!setCookieHeader,
        setCookieValue: setCookieHeader ? (Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader) : 'NOT SET',
        location: callbackResponse.url,
      });

      response.redirect(callbackResponse.url);
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
    * GET /api/auth/debug/session - セッション情報デバッグ
    * ✅ セッションが正しく設定されているか確認用
    */
   @Get('debug/session')
   async debugSession(
     @Session() session: Express.Session,
     @Req() request: Request,
   ): Promise<any> {
     return {
       sessionId: (session as any)?.id,
       userId: (session as any)?.userId,
       sessionKeys: Object.keys(session || {}),
       cookies: request.headers.cookie || '(none)',
       allCookies: request.cookies || {},
       sessionContent: JSON.stringify(session || {}),
       headers: {
         'x-session-id': request.headers['x-session-id'],
         'authorization': request.headers.authorization ? '(present)' : '(none)',
       },
     };
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
    await this.userService.logout(BigInt(userId));

    // セッションを破棄（Express Session API）
    (session as any).destroy?.(() => {});

    return { message: 'Logged out successfully' };
  }
}

