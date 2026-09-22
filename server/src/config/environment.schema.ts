/**
 * Environment Variable Validation Schema
 * 
 * 実行順序：
 * 1. initializeBootstrap() が AWS Secrets Manager から JSON 秘密をロード
 *    → OAUTH_SECRETS から GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET などを process.env に設定
 *    → APP_SECRETS から JWT_SECRET, SESSION_SECRET などを process.env に設定
 * 
 * 2. validateEnvironment() が process.env をこのスキーマで検証
 *    → GOOGLE_OAUTH_ENABLED=true の場合、GOOGLE_CLIENT_ID などの存在を確認
 *    → 必須フィールドの型・長さをチェック
 *    → バリデーション失敗時はプロセス終了（起動失敗）
 * 
 * ❗ IMPORTANT: initializeBootstrap() の後に validateEnvironment() を呼び出すこと
 *             順序が逆だと Secrets Manager のデータが検証されない
 */

import { z } from 'zod';

export const EnvironmentSchema = z.object({
  // ==================================================
  // Node Environment & Server
  // ==================================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // ==================================================
  // Database (PostgreSQL)
  // ==================================================
  DATABASE_URL: z.string().url('Invalid DATABASE_URL format'),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USERNAME: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),

  // ==================================================
  // Redis Cache
  // ==================================================
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_PASSWORD: z.string().optional(),

  // ==================================================
  // CORS & Security
  // ==================================================
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.enum(['true', 'false']).default('true'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  FRONTEND_URL: z.string().url().optional(),
  MOBILE_CALLBACK_URL: z.string().optional(),

  // ==================================================
  // JWT / Authentication
  // ==================================================
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  JWT_ALGORITHM: z.string().default('HS256'),

  // ==================================================
  // Session
  // ==================================================
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_TTL: z.coerce.number().default(86400),

  // ==================================================
  // OAuth Providers - Google (Required)
  // ==================================================
  GOOGLE_OAUTH_ENABLED: z.enum(['true', 'false']).default('false'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required when Google OAuth is enabled').optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required when Google OAuth is enabled').optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_DRIVE_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_SCOPES: z.string().optional(),

  // ==================================================
  // OAuth Providers - OneDrive
  // ==================================================
  ONEDRIVE_OAUTH_ENABLED: z.enum(['true', 'false']).default('false'),
  ONEDRIVE_CLIENT_ID: z.string().optional(),
  ONEDRIVE_CLIENT_SECRET: z.string().optional(),
  ONEDRIVE_REDIRECT_URI: z.string().url().optional(),
  ONEDRIVE_SCOPES: z.string().optional(),

  // ==================================================
  // Encryption
  // ==================================================
  ENCRYPTION_KEY: z.string().min(64, 'ENCRYPTION_KEY must be at least 64 characters'),
  ENCRYPTION_ALGORITHM: z.string().default('aes-256-gcm'),

  // ==================================================
  // File Storage
  // ==================================================
  STORAGE_PATH: z.string().default('./uploads'),
  SCREENSHOT_MAX_SIZE: z.coerce.number().default(5242880),
  SCREENSHOT_QUALITY: z.coerce.number().default(90),

  // ==================================================
  // Rate Limiting
  // ==================================================
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // ==================================================
  // AWS Secrets Manager (Optional, for ECS)
  // ==================================================
  APP_SECRETS: z.string().optional(),
  DB_CREDENTIALS: z.string().optional(),
  REDIS_CREDENTIALS: z.string().optional(),
  OAUTH_SECRETS: z.string().optional(),
}).superRefine((data: Environment, ctx: z.RefinementCtx) => {
  // Google OAuth 検証
  if (data.GOOGLE_OAUTH_ENABLED === 'true') {
    if (!data.GOOGLE_CLIENT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GOOGLE_CLIENT_ID'],
        message: 'GOOGLE_CLIENT_ID is required when GOOGLE_OAUTH_ENABLED=true',
      });
    }
    if (!data.GOOGLE_CLIENT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GOOGLE_CLIENT_SECRET'],
        message: 'GOOGLE_CLIENT_SECRET is required when GOOGLE_OAUTH_ENABLED=true',
      });
    }
    if (!data.GOOGLE_REDIRECT_URI) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['GOOGLE_REDIRECT_URI'],
        message: 'GOOGLE_REDIRECT_URI is required when GOOGLE_OAUTH_ENABLED=true',
      });
    }
  }

  // OneDrive OAuth 検証
  if (data.ONEDRIVE_OAUTH_ENABLED === 'true') {
    if (!data.ONEDRIVE_CLIENT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ONEDRIVE_CLIENT_ID'],
        message: 'ONEDRIVE_CLIENT_ID is required when ONEDRIVE_OAUTH_ENABLED=true',
      });
    }
    if (!data.ONEDRIVE_CLIENT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ONEDRIVE_CLIENT_SECRET'],
        message: 'ONEDRIVE_CLIENT_SECRET is required when ONEDRIVE_OAUTH_ENABLED=true',
      });
    }
  }
});

export type Environment = z.infer<typeof EnvironmentSchema>;
