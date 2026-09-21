import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { AppModule } from './app.module';
import { generateOpenAPIYaml } from './utils/openapi-generator';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { pinoLogger } from './common/logger/pino.logger';
import { parseSecret, getSecretValue } from './common/utils/secret-parser.util';

async function bootstrap() {
  // ========================================
  // IMPORTANT: Parse secrets BEFORE NestFactory.create
  // EncryptionService is instantiated during NestFactory.create,
  // and it needs ENCRYPTION_KEY to be set beforehand
  // ========================================

  // ========================================
  // Parse App secrets from JSON secret (AWS Secrets Manager)
  // ========================================
  const appSecretsJson = process.env.APP_SECRETS;
  if (appSecretsJson) {
    try {
      const parsedAppSecrets = parseSecret(appSecretsJson);
      if (typeof parsedAppSecrets === 'object' && parsedAppSecrets !== null) {
        // Set app secrets environment variables from JSON BEFORE NestFactory.create
        if (parsedAppSecrets.jwt_secret) {
          process.env.JWT_SECRET = parsedAppSecrets.jwt_secret;
        }
        if (parsedAppSecrets.session_secret) {
          process.env.SESSION_SECRET = parsedAppSecrets.session_secret;
        }
        if (parsedAppSecrets.encryption_key) {
          process.env.ENCRYPTION_KEY = parsedAppSecrets.encryption_key;
        } else {
          console.error('❌ ERROR: encryption_key is missing from APP_SECRETS');
          console.error('Available keys in APP_SECRETS:', Object.keys(parsedAppSecrets));
        }
        if (parsedAppSecrets.encryption_algorithm) {
          process.env.ENCRYPTION_ALGORITHM = parsedAppSecrets.encryption_algorithm;
        }
        console.log('✅ App secrets loaded from JSON secret BEFORE NestFactory.create');
        console.log('✅ ENCRYPTION_KEY set:', !!process.env.ENCRYPTION_KEY);
      } else {
        console.error('❌ ERROR: Parsed APP_SECRETS is not a valid object');
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse APP_SECRETS JSON secret:', error);
      console.error('APP_SECRETS content type:', typeof appSecretsJson);
      console.error('APP_SECRETS length:', appSecretsJson?.length);
    }
  } else {
    console.warn('⚠️ APP_SECRETS environment variable is not set');
  }



  // ========================================
  // Parse RDS credentials from JSON secret (AWS Secrets Manager)
  // ========================================
  const dbSecretsJson = process.env.DB_CREDENTIALS;
  let dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'danmaku',
  };

  if (dbSecretsJson) {
    try {
      const parsedDbSecrets = parseSecret(dbSecretsJson);
      if (typeof parsedDbSecrets === 'object' && parsedDbSecrets !== null) {
        dbConfig = {
          host: parsedDbSecrets.host || dbConfig.host,
          port: parsedDbSecrets.port ? parseInt(String(parsedDbSecrets.port), 10) : dbConfig.port,
          username: parsedDbSecrets.username || dbConfig.username,
          password: parsedDbSecrets.password || dbConfig.password,
          database: parsedDbSecrets.dbname || dbConfig.database,
        };
        console.log(`✅ RDS credentials loaded from JSON secret: ${dbConfig.host}:${dbConfig.port}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse DB_CREDENTIALS JSON secret, using env vars fallback:`, error);
    }
  }

  // Store RDS config in process for ConfigService to use
  process.env.TYPEORM_HOST = dbConfig.host;
  process.env.TYPEORM_PORT = String(dbConfig.port);
  process.env.TYPEORM_USERNAME = dbConfig.username;
  process.env.TYPEORM_PASSWORD = dbConfig.password;
  process.env.TYPEORM_DATABASE = dbConfig.database;

  // Construct DATABASE_URL for Drizzle ORM (postgres://)
  // Format: postgresql://username:password@host:port/database
  const databaseUrl = `postgresql://${dbConfig.username}:${encodeURIComponent(dbConfig.password)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
  process.env.DATABASE_URL = databaseUrl;
  console.log(`✅ DATABASE_URL constructed: postgresql://${dbConfig.username}:***@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

  // ========================================
  // Parse OAuth secrets from JSON secret (AWS Secrets Manager)
  // ========================================
  const oauthSecretsJson = process.env.OAUTH_SECRETS;
  if (oauthSecretsJson) {
    try {
      const parsedOAuthSecrets = parseSecret(oauthSecretsJson);
      if (typeof parsedOAuthSecrets === 'object' && parsedOAuthSecrets !== null) {
        // Set OAuth environment variables from JSON
        if (parsedOAuthSecrets.google_client_id) {
          process.env.GOOGLE_CLIENT_ID = parsedOAuthSecrets.google_client_id;
        }
        if (parsedOAuthSecrets.google_client_secret) {
          process.env.GOOGLE_CLIENT_SECRET = parsedOAuthSecrets.google_client_secret;
        }
        if (parsedOAuthSecrets.onedrive_client_id) {
          process.env.ONEDRIVE_CLIENT_ID = parsedOAuthSecrets.onedrive_client_id;
        }
        if (parsedOAuthSecrets.onedrive_client_secret) {
          process.env.ONEDRIVE_CLIENT_SECRET = parsedOAuthSecrets.onedrive_client_secret;
        }
        console.log('✅ OAuth secrets loaded from JSON secret');
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse OAUTH_SECRETS JSON secret, using env vars fallback:', error);
    }
  }

  // ========================================
  // Parse Redis credentials from JSON secret (AWS Secrets Manager)
  // ========================================
  const redisSecretsJson = process.env.REDIS_CREDENTIALS;
  let redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  };

  if (redisSecretsJson) {
    try {
      const parsedRedisSecrets = parseSecret(redisSecretsJson);
      if (typeof parsedRedisSecrets === 'object' && parsedRedisSecrets !== null) {
        redisConfig = {
          host: parsedRedisSecrets.host || redisConfig.host,
          port: parsedRedisSecrets.port ? parseInt(String(parsedRedisSecrets.port), 10) : redisConfig.port,
          password: parsedRedisSecrets.password || redisConfig.password,
          db: parsedRedisSecrets.db ? parseInt(String(parsedRedisSecrets.db), 10) : redisConfig.db,
        };
        console.log(`✅ Redis credentials loaded from JSON secret: ${redisConfig.host}:${redisConfig.port}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse REDIS_CREDENTIALS JSON secret, using env vars fallback:', error);
    }
  }

  const redisHost = redisConfig.host;
  const redisPort = redisConfig.port;
  const redisPassword = redisConfig.password;
  const redisDb = redisConfig.db;
  
  // Store Redis config in process for ConfigService to use
  process.env.REDIS_HOST = redisHost;
  process.env.REDIS_PORT = String(redisPort);
  if (redisPassword) {
    process.env.REDIS_PASSWORD = redisPassword;
  }
  process.env.REDIS_DB = String(redisDb);

  // Redis セッションストア設定
  const redisClient = createClient({
    socket: {
      host: redisHost,
      port: redisPort,
    },
    password: redisPassword,
  });

  // Redis クライアントの接続
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient as any,
    prefix: 'session:',
  });

  // Get session secret from JSON secret or individual env var
  // (appSecretsJson is already set in the pre-initialization phase above)
  const sessionSecret = getSecretValue(appSecretsJson, 'session_secret', 'SESSION_SECRET') || 'default-session-secret';
  const cookieSecure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
  
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  // ✅ Pino ロギングを NestJS に統合
  app.useLogger(pinoLogger as any);
  // ✅ TraceId middleware を登録
  app.use(new TraceIdMiddleware().use.bind(new TraceIdMiddleware()));

  // ✅ JSON ボディパーサーを BEFORE session middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use(
    session({
      store: redisStore,
      secret: sessionSecret,
      resave: true,  // クッキーを毎回更新（OAuth callback後の確実な設定）
      saveUninitialized: true,  // 未初期化セッションも保存
      cookie: {
        secure: cookieSecure,
        httpOnly: true,
        // sameSite: クロスオリジン時は無効化（開発環境）、本番ではLax
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14日
        path: '/',  // ルートパスでクッキーを共有
        domain: process.env.NODE_ENV === 'production' ? '.danmaku.cloud' : undefined,  // 本番環境でのクロスオリジン対応
      },
      name: 'danmaku.session.id',
    }),
  );



  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001';
  app.enableCors({
    origin: corsOrigin.split(',').map(origin => origin.trim()),
    credentials: true,  // クッキーを許可
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length'],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      skipMissingProperties: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Danmaku API')
    .setDescription('Danmaku API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Generate OpenAPI YAML file at startup (only in development)
  // In production, file system writes are restricted due to non-root user
  if (process.env.NODE_ENV === 'development') {
    try {
      await generateOpenAPIYaml(app, 'openapi.yaml');
      console.log('✅ OpenAPI YAML generated successfully');
    } catch (error) {
      console.warn('⚠️ Failed to generate OpenAPI YAML:', error);
    }
  } else {
    console.log('⏭️ Skipping OpenAPI YAML generation in production environment');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();