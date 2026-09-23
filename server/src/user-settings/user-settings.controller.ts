import {
  Controller,
  Get,
  Patch,
  Body,
  Session,
  UseGuards,
  BadRequestException,
  HttpCode,
  Logger,
} from '@nestjs/common';
import type { Express } from 'express';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto, UserSettingsDto } from './dto/user-settings.dto';
import { AuthGuard } from '../auth/guards';

/**
 * ユーザー設定 API コントローラー
 *
 * エンドポイント:
 * - GET /api/user-settings - 現在のユーザー設定を取得
 * - PATCH /api/user-settings - ユーザー設定を更新
 */
@Controller('api/user-settings')
export class UserSettingsController {
  private readonly logger = new Logger('UserSettingsController');

  constructor(private readonly userSettingsService: UserSettingsService) {}

  /**
   * GET /api/user-settings - ユーザー設定を取得
   *
   * 現在のユーザーの設定を取得します。
   * 存在しない場合はデフォルト値で自動作成します。
   */
  @Get()
  @UseGuards(AuthGuard)
  async getSettings(@Session() session: Express.Session): Promise<UserSettingsDto> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return this.userSettingsService.getOrCreateSettings(BigInt(userId));
  }

  /**
   * PATCH /api/user-settings - ユーザー設定を更新
   *
   * 指定されたフィールドのみを更新します。
   * 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg
   *
   * @param updateDto 更新対象のフィールド
   * @returns 更新されたユーザー設定
   */
  @Patch()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async updateSettings(
    @Session() session: Express.Session,
    @Body() updateDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDto> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    this.logger.log(`[PATCH] updateDto:`, { 
      keys: Object.keys(updateDto || {}), 
      value: JSON.stringify(updateDto) 
    });

    return this.userSettingsService.updateSettings(
      BigInt(userId),
      updateDto,
    );
  }

  /**
   * PATCH /api/user-settings/reset - ユーザー設定をリセット
   *
   * すべての設定をデフォルト値に戻します。
   */
  @Patch('reset')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async resetSettings(@Session() session: Express.Session): Promise<UserSettingsDto> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return this.userSettingsService.resetSettings(BigInt(userId));
  }
}
