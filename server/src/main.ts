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

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });

  // ✅ Pino ロギングを NestJS に統合
  app.useLogger(pinoLogger as any);

  // Redis セッションストア設定
  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    password: process.env.REDIS_PASSWORD,
  });

  // Redis クライアントの接続
  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient as any,
    prefix: 'session:',
  });

  // Express session 設定
  const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key';
  const cookieSecure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';

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

  // Generate OpenAPI YAML file at startup
  await generateOpenAPIYaml(app, 'openapi.yaml');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();