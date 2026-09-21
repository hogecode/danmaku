/**
 * AWS Secrets Manager のパース処理を一元管理
 * 
 * ❗ IMPORTANT: NestFactory.create BEFORE に実行される必要がある
 * EncryptionService などが起動時に process.env を読むため
 */

import { parseSecret } from '../common/utils/secret-parser.util';

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
  console.log('📋 Loading secrets from AWS Secrets Manager...');

  const appSecrets: AppSecrets = parseAppSecrets();
  const dbConfig: DatabaseSecrets = parseDatabaseSecrets();
  const redisConfig: RedisSecrets = parseRedisSecrets();
  const oauthSecrets: OAuthSecrets = parseOAuthSecrets();

  console.log('✅ All secrets loaded successfully');
  return { appSecrets, dbConfig, redisConfig, oauthSecrets };
}

function parseAppSecrets(): AppSecrets {
  const appSecrets: AppSecrets = {};
  const appSecretsJson = process.env.APP_SECRETS;
  
  if (!appSecretsJson) {
    console.warn('⚠️ APP_SECRETS not set');
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
        console.error('❌ encryption_key is missing');
      }
      if (parsed.encryption_algorithm) {
        process.env.ENCRYPTION_ALGORITHM = parsed.encryption_algorithm;
        appSecrets.encryption_algorithm = parsed.encryption_algorithm;
      }
      console.log('✅ App secrets loaded');
    }
  } catch (error) {
    console.warn('⚠️ Failed to parse APP_SECRETS:', error);
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
        console.log(`✅ Database credentials loaded: ${dbConfig.host}:${dbConfig.port}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse DB_CREDENTIALS:', error);
    }
  }

  process.env.TYPEORM_HOST = dbConfig.host;
  process.env.TYPEORM_PORT = String(dbConfig.port);
  process.env.TYPEORM_USERNAME = dbConfig.username;
  process.env.TYPEORM_PASSWORD = dbConfig.password;
  process.env.TYPEORM_DATABASE = dbConfig.dbname;

  const databaseUrl = `postgresql://${dbConfig.username}:${encodeURIComponent(dbConfig.password)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.dbname}`;
  process.env.DATABASE_URL = databaseUrl;
  console.log(`✅ DATABASE_URL constructed`);
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
        console.log(`✅ Redis credentials loaded: ${redisConfig.host}:${redisConfig.port}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse REDIS_CREDENTIALS:', error);
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

function parseOAuthSecrets(): OAuthSecrets {
  const oauthSecrets: OAuthSecrets = {};
  const oauthSecretsJson = process.env.OAUTH_SECRETS;

  if (!oauthSecretsJson) {
    console.warn('⚠️ OAUTH_SECRETS not set');
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
      console.log('✅ OAuth secrets loaded');
    }
  } catch (error) {
    console.warn('⚠️ Failed to parse OAUTH_SECRETS:', error);
  }

  return oauthSecrets;
}
