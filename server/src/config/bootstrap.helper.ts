/**
 * NestJS Bootstrap 用のヘルパー関数
 * main.ts の初期化処理を整理
 * 
 * 実行順序（main.ts）:
 * 1. await initializeBootstrap()
 *    → loadSecretsToProcessEnv() で AWS Secrets Manager から秘密をロード
 *    → process.env に展開
 * 2. await validateEnvironment()
 *    → environment.schema.ts で process.env をバリデーション
 *    → 失敗時はプロセス終了
 * 3. NestFactory.create()
 *    → 全ての環境変数が検証済みで安全
 */

import { createClient, RedisClientType } from 'redis';
import { loadSecretsToProcessEnv, RedisSecrets } from './secrets.loader';
import { pinoLogger } from '../common/logger/pino.logger';

/**
 * Redis セッションストア用クライアント + エラーハンドリング
 */
export async function createSessionRedisClient(
  redisConfig: RedisSecrets,
): Promise<RedisClientType> {
  // 🔧 パスワード検証
  if (!redisConfig.password) {
    pinoLogger.info('ℹ️ REDIS_PASSWORD is not set. Redis instance is configured without password protection.');
  }

  const redisClient = createClient({
    socket: {
      host: redisConfig.host,
      port: redisConfig.port,
      // 接続タイムアウト: 5秒
      connectTimeout: 5000,
      // 再接続時のリトライ間隔: 300ms ～ 3s (exponential backoff)
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          pinoLogger.error('🔴 Redis: Max reconnection attempts reached. Stopping reconnection.');
          return new Error('Max reconnection attempts reached');
        }
        const delay = Math.min(retries * 300, 3000);
        pinoLogger.warn(`⏳ Redis reconnection attempt #${retries}, delay: ${delay}ms`);
        return delay;
      },
    },
    // パスワードが設定されている場合のみ指定
    ...(redisConfig.password && { password: redisConfig.password }),
  });

  // ✅ エラーハンドラを登録
  redisClient.on('error', (err) => {
    pinoLogger.error({
      host: redisConfig.host,
      port: redisConfig.port,
      hasPassword: !!redisConfig.password,
      err,
    }, '🔴 Redis Client Error (session store)');
  });

  redisClient.on('connect', () => {
    pinoLogger.info({
      host: redisConfig.host,
      port: redisConfig.port,
    }, '✅ Redis connected (session store)');
  });

  redisClient.on('reconnecting', () => {
    pinoLogger.warn({
      host: redisConfig.host,
      port: redisConfig.port,
    }, '⏳ Redis reconnecting (session store)...');
  });

  redisClient.on('ready', () => {
    pinoLogger.info('✅ Redis ready for commands (session store)');
  });

  // 接続
  try {
    pinoLogger.info({
      host: redisConfig.host,
      port: redisConfig.port,
      hasPassword: !!redisConfig.password,
    }, 'ℹ️ Attempting to connect to Redis (session store)...');
    
    await redisClient.connect();
    
    pinoLogger.info('✅ Redis initial connection successful (session store)');
  } catch (err) {
    pinoLogger.error({
      host: redisConfig.host,
      port: redisConfig.port,
      hasPassword: !!redisConfig.password,
      err,
    }, '🔴 Failed to connect to Redis (session store)');
    throw err;
  }

  return redisClient as RedisClientType;
}

/**
 * Bootstrap 初期化関数
 * - 秘密をパース
 * - Redis セッションストアを初期化
 * - process.env を設定
 */
export async function initializeBootstrap(): Promise<{
  redisClient: RedisClientType;
}> {
  let redisConfig: RedisSecrets;

  if(process.env.NODE_ENV == 'production') {
    // ✅ 全秘密をパース（NestFactory.create 前に実行）
    const secrets = loadSecretsToProcessEnv();
    redisConfig = secrets.redisConfig;
    pinoLogger.info({
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
      hasPassword: !!redisConfig.password,
    }, '✅ Redis configuration from Secrets Manager');
  } else {
    // ローカル開発環境では .env から設定
    redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    };
    pinoLogger.info({
      host: redisConfig.host,
      port: redisConfig.port,
      db: redisConfig.db,
      hasPassword: !!redisConfig.password,
    }, '✅ Redis configuration from .env');
  }
  // ✅ Redis セッションストアクライアントを初期化
  const redisClient = await createSessionRedisClient(redisConfig);

  return { redisClient };
}
