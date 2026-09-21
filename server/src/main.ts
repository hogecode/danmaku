import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { AppModule } from './app.module';
import { generateOpenAPIYaml } from './utils/openapi-generator';
import { TraceIdMiddleware } from './common/middleware/trace-id.middleware';
import { pinoLogger } from './common/logger/pino.logger';
import { getSecretValue } from './common/utils/secret-parser.util';
import { initializeBootstrap } from './config';

async function bootstrap() {
  // ========================================
  // ✅ Initialize secrets and Redis (BEFORE NestFactory.create)
  // ========================================
  const { redisClient } = await initializeBootstrap();

  const redisStore = new RedisStore({
    client: redisClient as any,
    prefix: 'session:',
  });

  const sessionSecret = getSecretValue(process.env.APP_SECRETS, 'session_secret', 'SESSION_SECRET') || 'default-session-secret';
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
      resave: true,
      saveUninitialized: true,
      cookie: {
        secure: cookieSecure,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.danmaku.cloud' : undefined,
      },
      name: 'danmaku.session.id',
    }),
  );

  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001';
  app.enableCors({
    origin: corsOrigin.split(',').map(origin => origin.trim()),
    credentials: true,
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

  const port = Number(process.env.PORT || 3001);

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 NestJS listening on 0.0.0.0:${port}`);
  console.log(`Application running on http://0.0.0.0:${port}`);
  console.log(`Swagger documentation available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
