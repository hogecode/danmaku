import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

/**
 * ユーザー設定 DTO
 */

export class UserSettingsDto {
  id!: string;
  user_id!: string;

  // Display Settings
  theme!: string; // 'light', 'dark'
  language!: string; // 'jp', 'en', etc

  // Playback Settings
  auto_play_next!: boolean;
  playback_speed!: string; // '0.5', '1.0', '1.5', '2.0'

  // Danmaku Settings
  danmaku_enabled!: boolean;
  danmaku_opacity!: string; // '0.0' - '1.0'
  danmaku_max_count!: number; // Maximum comments displayed
  danmaku_display_duration!: number; // milliseconds

  // NG Word Settings
  ng_words_reg!: string | null; // Regex pattern: "word1|word2|word3"

  created_at!: Date;
  updated_at!: Date;
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  auto_play_next?: boolean;

  @IsOptional()
  @IsString()
  playback_speed?: string;

  @IsOptional()
  @IsBoolean()
  danmaku_enabled?: boolean;

  @IsOptional()
  @IsString()
  danmaku_opacity?: string;

  @IsOptional()
  @IsNumber()
  danmaku_max_count?: number;

  @IsOptional()
  @IsNumber()
  danmaku_display_duration?: number;

  @IsOptional()
  @IsString()
  ng_words_reg?: string | null;
}
