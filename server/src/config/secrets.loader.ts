/**
 * AWS Secrets Manager のパース処理を一元管理
 * 
 * ========================================
 * 実行フロー
 * ========================================
 * 1. main.ts: await initializeBootstrap()
 *    ↓
 * 2. bootstrap.helper.ts: initializeBootstrap()
 *    → loadSecretsToProcessEnv()
 *       ├─ parseAppSecrets()         [danmaku/app-secrets]
 *       ├─ parseDatabaseSecrets()    [danmaku/db-credentials]
 *       ├─ parseRedisSecrets()       [danmaku/redis-credentials]
 *       └─ parseOAuthSecrets()       [danmaku/oauth-secrets]
 * 3. main.ts: await validateEnvironment()
 *    → EnvironmentSchema.safeParse(process.env)
 * 4. main.ts: NestFactory.create()
 *
 * ========================================
 * Secrets Manager vs Environment Variables
 * ========================================
 * 
 * ✅ Secrets Manager に格納 (本番環境):
 *   - JWT_SECRET
 *   - SESSION_SECRET
 *   - ENCRYPTION_KEY
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 *   - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
 *
 * ✅ Environment Variables に設定 (Terraform tfvars):
 *   - NODE_ENV
 *   - PORT
 *   - LOG_LEVEL
 *   - CORS_ORIGIN
 *   - FRONTEND_URL
 *   - JWT_ACCESS_EXPIRATION
 *   - GOOGLE_OAUTH_ENABLED
 *   - ENABLE_*（機能フラグ）
 *   - その他の設定値
 * 
 * ========================================
 * マッピング
 * ========================================
 * 
 * danmaku/app-secrets (JSON)
 *   ├─ jwt_secret → process.env.JWT_SECRET
 *   ├─ session_secret → process.env.SESSION_SECRET
 *   ├─ encryption_key → process.env.ENCRYPTION_KEY
 *   └─ encryption_algorithm → process.env.ENCRYPTION_ALGORITHM
 *
 * danmaku/oauth-secrets (JSON)
 *   ├─ google_client_id → process.env.GOOGLE_CLIENT_ID
 *   ├─ google_client_secret → process.env.GOOGLE_CLIENT_SECRET
 *   ├─ onedrive_client_id → process.env.ONEDRIVE_CLIENT_ID
 *   └─ onedrive_client_secret → process.env.ONEDRIVE_CLIENT_SECRET
 *
 * danmaku/db-credentials (JSON)
 *   ├─ host → process.env.DB_HOST, process.env.TYPEORM_HOST
 *   ├─ port → process.env.DB_PORT, process.env.TYPEORM_PORT
 *   ├─ username → process.env.DB_USERNAME, process.env.TYPEORM_USERNAME
 *   ├─ password → process.env.DB_PASSWORD, process.env.TYPEORM_PASSWORD
 *   └─ dbname → process.env.DB_NAME, process.env.TYPEORM_DATABASE
 *
 * danmaku/redis-credentials (JSON)
 *   ├─ host → process.env.REDIS_HOST
 *   ├─ port → process.env.REDIS_PORT
 *   ├─ password → process.env.REDIS_PASSWORD
 *   └─ db → process.env.REDIS_DB
 * 
 * ❗ IMPORTANT: 
 *   - loadSecretsToProcessEnv() は NestFactory.create() 前に実行必須
 *   - EncryptionService などが起動時に process.env を読むため
 *   - validateEnvironment() 前に実行必須
 *   - Secrets Manager のデータが environment.schema.ts で検証されるように
 */

import { parseSecret } from '../common/utils/secret-parser.util';
import { pinoLogger } from '../common/logger/pino.logger';

/**
 * App Secrets
 */
export interface AppSecrets {
  jwt_secret?: string;
  session_secret?: string;
  encryption_key?: string;
  encryption_algorithm?: string;
}

/**
 * Database Secrets
 */
export interface DatabaseSecrets {
  host: string;
  port: number;
  username: string;
  password: string;
  dbname: string;
}

/**
 * Redis Secrets
 */
export interface RedisSecrets {
  host: string;
  port: number;
  password?: string;
  db: number;
}

/**
 * OAuth Secrets
 */
export interface OAuthSecrets {
  google_client_id?: string;
  google_client_secret?: string;
  onedrive_client_id?: string;
  onedrive_client_secret?: string;
}

/**
 * 全秘密をパースして process.env に設定
 */
export function loadSecretsToProcessEnv(): {
  appSecrets: AppSecrets;
  dbConfig: DatabaseSecrets;
  redisConfig: RedisSecrets;
  oauthSecrets: OAuthSecrets;
} {
  pinoLogger.info('📋 Loading secrets from AWS Secrets Manager...');

  const appSecrets: AppSecrets = parseAppSecrets();
  const dbConfig: DatabaseSecrets = parseDatabaseSecrets();
  const redisConfig: RedisSecrets = parseRedisSecrets();
  const oauthSecrets: OAuthSecrets = parseOAuthSecrets();

  pinoLogger.info('✅ All secrets loaded successfully');
  return { appSecrets, dbConfig, redisConfig, oauthSecrets };
}

/**
 * Parse APP_SECRETS from AWS Secrets Manager
 * 
 * Secrets Manager Secret: danmaku/app-secrets
 * {
 *   "jwt_secret": "your-jwt-secret-min-32-chars",
 *   "session_secret": "your-session-secret-min-32-chars",
 *   "encryption_key": "your-encryption-key-min-64-chars",
 *   "encryption_algorithm": "aes-256-gcm"
 * }
 * 
 * Maps to Environment Variables:
 *   - JWT_SECRET
 *   - SESSION_SECRET
 *   - ENCRYPTION_KEY
 *   - ENCRYPTION_ALGORITHM
 */
function parseAppSecrets(): AppSecrets {
  const appSecrets: AppSecrets = {};
  const appSecretsJson = process.env.APP_SECRETS;
  
  if (!appSecretsJson) {
    pinoLogger.warn('⚠️ APP_SECRETS not set (expected from AWS Secrets Manager)');
    return appSecrets;
  }

  try {
    const parsed = parseSecret(appSecretsJson);
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.jwt_secret) {
        process.env.JWT_SECRET = parsed.jwt_secret;
        appSecrets.jwt_secret = parsed.jwt_secret;
      }
      if (parsed.session_secret) {
        process.env.SESSION_SECRET = parsed.session_secret;
        appSecrets.session_secret = parsed.session_secret;
      }
      if (parsed.encryption_key) {
        process.env.ENCRYPTION_KEY = parsed.encryption_key;
        appSecrets.encryption_key = parsed.encryption_key;
      } else {
        pinoLogger.error('❌ encryption_key is missing in APP_SECRETS');
      }
      if (parsed.encryption_algorithm) {
        process.env.ENCRYPTION_ALGORITHM = parsed.encryption_algorithm;
        appSecrets.encryption_algorithm = parsed.encryption_algorithm;
      }
      pinoLogger.info('✅ App secrets loaded from danmaku/app-secrets');
    }
  } catch (error) {
    pinoLogger.warn({ err: error as Error }, 'Failed to parse APP_SECRETS JSON');
  }
  return appSecrets;
}

function parseDatabaseSecrets(): DatabaseSecrets {
  const dbConfig: DatabaseSecrets = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || '',
    dbname: process.env.DB_NAME || 'danmaku',
  };

  const dbSecretsJson = process.env.DB_CREDENTIALS;
  if (dbSecretsJson) {
    try {
      const parsed = parseSecret(dbSecretsJson);
      if (typeof parsed === 'object' && parsed !== null) {
        dbConfig.host = parsed.host || dbConfig.host;
        dbConfig.port = parsed.port ? parseInt(String(parsed.port), 10) : dbConfig.port;
        dbConfig.username = parsed.username || dbConfig.username;
        dbConfig.password = parsed.password || dbConfig.password;
        dbConfig.dbname = parsed.dbname || dbConfig.dbname;
        pinoLogger.info(`✅ Database credentials loaded: ${dbConfig.host}:${dbConfig.port}`);
      }
    } catch (error) {
      pinoLogger.warn({ err: error as Error }, 'Failed to parse DB_CREDENTIALS');
    }
  }

  process.env.TYPEORM_HOST = dbConfig.host;
  process.env.TYPEORM_PORT = String(dbConfig.port);
  process.env.TYPEORM_USERNAME = dbConfig.username;
  process.env.TYPEORM_PASSWORD = dbConfig.password;
  process.env.TYPEORM_DATABASE = dbConfig.dbname;

  const databaseUrl = `postgresql://${dbConfig.username}:${encodeURIComponent(dbConfig.password)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbname}`;
  process.env.DATABASE_URL = databaseUrl;
  pinoLogger.info(`✅ DATABASE_URL constructed`);
  return dbConfig;
}

function parseRedisSecrets(): RedisSecrets {
  const redisConfig: RedisSecrets = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  };

  const redisSecretsJson = process.env.REDIS_CREDENTIALS;
  if (redisSecretsJson) {
    try {
      const parsed = parseSecret(redisSecretsJson);
      if (typeof parsed === 'object' && parsed !== null) {
        redisConfig.host = parsed.host || redisConfig.host;
        redisConfig.port = parsed.port ? parseInt(String(parsed.port), 10) : redisConfig.port;
        redisConfig.password = parsed.password || redisConfig.password;
        redisConfig.db = parsed.db ? parseInt(String(parsed.db), 10) : redisConfig.db;
        pinoLogger.info(`✅ Redis credentials loaded: ${redisConfig.host}:${redisConfig.port}`);
      }
    } catch (error) {
      pinoLogger.warn({ err: error as Error }, 'Failed to parse REDIS_CREDENTIALS');
    }
  }

  process.env.REDIS_HOST = redisConfig.host;
  process.env.REDIS_PORT = String(redisConfig.port);
  if (redisConfig.password) {
    process.env.REDIS_PASSWORD = redisConfig.password;
  }
  process.env.REDIS_DB = String(redisConfig.db);

  return redisConfig;
}

/**
 * Parse OAUTH_SECRETS from AWS Secrets Manager
 * 
 * Secrets Manager Secret: danmaku/oauth-secrets
 * {
 *   "google_client_id": "123456789-xxxxx.apps.googleusercontent.com",
 *   "google_client_secret": "GOCSPX-xxxxxxxxxxxxxxx",
 *   "onedrive_client_id": "optional-client-id",
 *   "onedrive_client_secret": "optional-client-secret"
 * }
 * 
 * Maps to Environment Variables:
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - ONEDRIVE_CLIENT_ID (optional)
 *   - ONEDRIVE_CLIENT_SECRET (optional)
 * 
 * Note: 有効なOAuth情報がない場合、environment.schema.ts で検証失敗となり、
 *      プロセスが起動失敗する
 */
function parseOAuthSecrets(): OAuthSecrets {
  const oauthSecrets: OAuthSecrets = {};
  const oauthSecretsJson = process.env.OAUTH_SECRETS;

  if (!oauthSecretsJson) {
    pinoLogger.warn('⚠️ OAUTH_SECRETS not set (expected from AWS Secrets Manager)');
    return oauthSecrets;
  }

  try {
    const parsed = parseSecret(oauthSecretsJson);
    if (typeof parsed === 'object' && parsed !== null) {
      if (parsed.google_client_id) {
        process.env.GOOGLE_CLIENT_ID = parsed.google_client_id;
        oauthSecrets.google_client_id = parsed.google_client_id;
      }
      if (parsed.google_client_secret) {
        process.env.GOOGLE_CLIENT_SECRET = parsed.google_client_secret;
        oauthSecrets.google_client_secret = parsed.google_client_secret;
      }
      if (parsed.onedrive_client_id) {
        process.env.ONEDRIVE_CLIENT_ID = parsed.onedrive_client_id;
        oauthSecrets.onedrive_client_id = parsed.onedrive_client_id;
      }
      if (parsed.onedrive_client_secret) {
        process.env.ONEDRIVE_CLIENT_SECRET = parsed.onedrive_client_secret;
        oauthSecrets.onedrive_client_secret = parsed.onedrive_client_secret;
      }
      pinoLogger.info('✅ OAuth secrets loaded from danmaku/oauth-secrets');
    }
  } catch (error) {
    pinoLogger.warn({ err: error as Error }, 'Failed to parse OAUTH_SECRETS JSON');
  }

  return oauthSecrets;
}

