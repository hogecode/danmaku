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
  const redisClient = createClient({
    socket: {
      host: redisConfig.host,
      port: redisConfig.port,
    },
    password: redisConfig.password,
  });

  // ✅ エラーハンドラを登録
  redisClient.on('error', (err) => {
    pinoLogger.error('Redis Client Error (session store)', err);
  });

  redisClient.on('connect', () => {
    pinoLogger.info('✅ Redis connected (session store)');
  });

  redisClient.on('reconnecting', () => {
    pinoLogger.warn('Redis reconnecting (session store)...');
  });

  // 接続
  await redisClient.connect().catch((err) => {
    pinoLogger.error('Failed to connect to Redis (session store)', err);
    throw err;
  });

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
  } else {
    // ローカル開発環境では .env から設定
    redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    };
  }
  // ✅ Redis セッションストアクライアントを初期化
  const redisClient = await createSessionRedisClient(redisConfig);

  return { redisClient };
}
