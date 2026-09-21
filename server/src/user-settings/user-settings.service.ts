import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import type { Database } from '../database/database.module';
import { userSettings } from '../database/session.schema';
import { UserSettingsDto, UpdateUserSettingsDto } from './dto/user-settings.dto';
import { LoggerService } from '../common/logger/logger.service';

/**
 * ユーザー設定サービス
 * 設定の取得と更新を管理
 */
@Injectable()
export class UserSettingsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: Database,
    private readonly logger: LoggerService,
  ) {}

  /**
   * ユーザー設定を取得
   * 存在しない場合はデフォルト値で作成
   */
  async getOrCreateSettings(userId: bigint): Promise<UserSettingsDto> {
    const existingSettings = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.user_id, userId))
      .limit(1);

    if (existingSettings.length > 0) {
      return this.mapToDto(existingSettings[0]);
    }

    // デフォルト値で作成
    const defaultSettings = await this.db
      .insert(userSettings)
      .values({
        user_id: userId,
        theme: 'light',
        language: 'jp',
        auto_play_next: false,
        playback_speed: '1.0',
        danmaku_enabled: true,
        danmaku_opacity: '1.0',
        danmaku_max_count: 1000,
        danmaku_display_duration: 5000,
        ng_words_reg: null,
      })
      .returning();

    return this.mapToDto(defaultSettings[0]);
  }

  /**
   * ユーザー設定を更新
   */
  async updateSettings(
    userId: bigint,
    updateDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDto> {
    // ユーザーが存在するか確認
    const existing = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.user_id, userId))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('User settings not found');
    }

    this.logger.debug('updateSettings received', { updateDto, keys: Object.keys(updateDto || {}) });

    // ✅ すべてのプロパティを明示的に抽出
    const updateData: Record<string, any> = {};

    // フロントエンドが送ってきたすべてのフィールドを抽出
    const fieldsToUpdate = [
      'theme',
      'language',
      'auto_play_next',
      'playback_speed',
      'danmaku_enabled',
      'danmaku_opacity',
      'danmaku_max_count',
      'danmaku_display_duration',
      'ng_words_reg',
    ];

    for (const field of fieldsToUpdate) {
      if (field in updateDto && (updateDto as any)[field] !== undefined) {
        updateData[field] = (updateDto as any)[field];
        this.logger.debug(`Setting field: ${field}`, { value: (updateDto as any)[field] });
      }
    }

    this.logger.debug('Extracted updateData', { updateData, keys: Object.keys(updateData) });

    // ✅ updated_at を常に更新
    updateData.updated_at = new Date();

    this.logger.debug('Final updateData to save', { updateData });

    const updated = await this.db
      .update(userSettings)
      .set(updateData)
      .where(eq(userSettings.user_id, userId))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('User settings not found');
    }

    return this.mapToDto(updated[0]);
  }

  /**
   * ユーザー設定をデフォルト値にリセット
   */
  async resetSettings(userId: bigint): Promise<UserSettingsDto> {
    const resetDto: UpdateUserSettingsDto = {
      theme: 'light',
      language: 'jp',
      auto_play_next: false,
      playback_speed: '1.0',
      danmaku_enabled: true,
      danmaku_opacity: '1.0',
      danmaku_max_count: 1000,
      danmaku_display_duration: 5000,
      ng_words_reg: null,
    };

    return this.updateSettings(userId, resetDto);
  }

  /**
   * DTO にマップ
   * BigInt を文字列に変換
   */
  private mapToDto(data: any): UserSettingsDto {
    return {
      id: data.id ? data.id.toString() : '',
      user_id: data.user_id ? data.user_id.toString() : '',
      theme: data.theme,
      language: data.language,
      auto_play_next: data.auto_play_next,
      playback_speed: data.playback_speed,
      danmaku_enabled: data.danmaku_enabled,
      danmaku_opacity: data.danmaku_opacity,
      danmaku_max_count: data.danmaku_max_count,
      danmaku_display_duration: data.danmaku_display_duration,
      ng_words_reg: data.ng_words_reg,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}
