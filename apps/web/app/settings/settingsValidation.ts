import { z } from 'zod';

/**
 * ユーザー設定フォームのバリデーションスキーマ
 */
export const settingsFormSchema = z.object({
  // Display Settings
  theme: z.enum(['light', 'dark'] as const, {
    message: 'テーマは「light」または「dark」である必要があります',
  }),
  language: z.enum(['jp', 'en'] as const, {
    message: '言語は「jp」または「en」である必要があります',
  }),

  // Playback Settings
  auto_play_next: z.boolean(),
  playback_speed: z.string().regex(/^(0\.5|0\.75|1\.0|1\.25|1\.5|2\.0)$/, {
    message: '再生速度は 0.5, 0.75, 1.0, 1.25, 1.5, 2.0 のいずれかである必要があります',
  }),

  // Danmaku Settings
  danmaku_enabled: z.boolean(),
  danmaku_opacity: z.string().regex(/^0(\.\d)?$|^1(\.0)?$/, {
    message: '不透明度は 0.0 から 1.0 の間である必要があります',
  }),
  danmaku_max_count: z.number().int().min(0).max(10000, {
    message: '最大表示数は 0 から 10000 の間である必要があります',
  }),
  danmaku_display_duration: z.number().int().min(1000).max(30000, {
    message: '表示時間は 1000 から 30000 ミリ秒の間である必要があります',
  }),

  // NG Word Settings
  ng_words_reg: z.string().optional().nullable(),
});

/**
 * 型定義
 */
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
