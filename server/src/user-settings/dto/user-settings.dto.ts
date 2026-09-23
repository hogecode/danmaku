import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

/**
 * ユーザー設定 DTO (レスポンス)
 * 
 * スキーマフィールド:
 * - id: bigint
 * - user_id: bigint
 * - theme: varchar (default: 'light')
 * - language: varchar (default: 'jp')
 * - danmaku_max_count: integer (default: 1000)
 * - ng_words_reg: jsonb (string[]) (default: [])
 * - created_at: timestamp
 * - updated_at: timestamp
 */
export class UserSettingsDto {
  id!: string; // BigInt -> string

  user_id!: string; // BigInt -> string

  // Display Settings
  theme!: string; // 'light', 'dark'

  language!: string; // 'jp', 'en', etc

  // Danmaku (Comment) Settings
  danmaku_max_count!: number; // Maximum comments displayed at once

  // NG Word Settings
  ng_words_reg!: string[]; // 正規表現配列: ["aaa|bbb", "ccc", "asd"]

  created_at!: Date;

  updated_at!: Date;
}

/**
 * ユーザー設定更新DTO (リクエスト)
 * 
 * 部分更新に対応: 指定されたフィールドのみ更新可能
 */
export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  danmaku_max_count?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ng_words_reg?: string[];
}
