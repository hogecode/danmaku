/**
 * Config モジュールのエントリーポイント
 */

/**
 * Config モジュールのエントリーポイント
 * 
 * 実行順序:
 * 1. initializeBootstrap() - AWS Secrets Manager から秘密をロード
 * 2. EnvironmentSchema.safeParse() - process.env をバリデーション
 * 3. NestFactory.create() - 全環境変数が検証済み
 */

export {
  loadSecretsToProcessEnv,
} from './secrets.loader';

export type {
  AppSecrets,
  DatabaseSecrets,
  RedisSecrets,
  OAuthSecrets,
} from './secrets.loader';

export { initializeBootstrap, createSessionRedisClient } from './bootstrap.helper';

export { EnvironmentSchema } from './environment.schema';

export type { Environment } from './environment.schema';
