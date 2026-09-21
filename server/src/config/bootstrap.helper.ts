/**
 * NestJS Bootstrap 用のヘルパー関数
 * main.ts の初期化処理を整理
 */

import { createClient, RedisClientType } from 'redis';
import { loadSecretsToProcessEnv, RedisSecrets } from './secrets.loader';

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
    console.error('❌ Redis Client Error (session store):', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected (session store)');
  });

  redisClient.on('reconnecting', () => {
    console.warn('⏳ Redis reconnecting (session store)...');
  });

  // 接続
  await redisClient.connect().catch((err) => {
    console.error('❌ Failed to connect to Redis (session store):', err);
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
  // ✅ 全秘密をパース（NestFactory.create 前に実行）
  const { redisConfig } = loadSecretsToProcessEnv();

  // ✅ Redis セッションストアクライアントを初期化
  const redisClient = await createSessionRedisClient(redisConfig);

  return { redisClient };
}
