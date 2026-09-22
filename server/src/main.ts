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
import { EnvironmentSchema } from './config/environment.schema';

async function validateEnvironment() {
  try {
    const result = EnvironmentSchema.safeParse(process.env);
    
    if (!result.success) {
      const errors = result.error.issues.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      }).join('\n  ');
      
      const errorMessage = `Environment validation failed:\n  ${errors}`;
      pinoLogger.fatal({ errors: result.error.issues }, errorMessage);
      process.exit(1);
    }
    
    pinoLogger.info('✅ Environment validation passed');
    return result.data;
  } catch (error: unknown) {
    pinoLogger.fatal({ err: error as Error }, 'Fatal error during environment validation');
    process.exit(1);
  }
}

async function bootstrap() {
  // ========================================
  // ✅ 1. Initialize secrets from AWS Secrets Manager (BEFORE validation)
  // ✅ This loads JSON secrets (OAUTH_SECRETS, APP_SECRETS, etc.) into process.env
  // ========================================
  const { redisClient } = await initializeBootstrap();

  // ========================================
  // ✅ 2. Validate environment variables (AFTER secrets are loaded)
  // ✅ Now GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc. are available in process.env
  // ========================================
  //await validateEnvironment();

  const redisStore = new RedisStore({
    client: redisClient as any,
    prefix: 'session:',
  });

  pinoLogger.info('✅ RedisStore created successfully');

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

  // ✅ Cookie domain を FRONTEND_URL から推定
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const frontendDomain = new URL(frontendUrl).hostname;
  const cookieDomain = process.env.NODE_ENV === 'production' 
    ? frontendDomain.replace(/^www\./, '') // www を除去、例: danmaku.cloud
    : undefined;

  pinoLogger.info({
    secure: cookieSecure,
    domain: cookieDomain,
    sameSite: 'lax',
    frontendUrl,
    frontendDomain,
  }, '🍪 Session Cookie Configuration');

  app.use(
    session({
      store: redisStore,
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
      cookie: {
        secure: cookieSecure,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 14 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: cookieDomain,
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
      pinoLogger.info('OpenAPI YAML generated successfully');
    } catch (error) {
      pinoLogger.warn({ err: error as Error }, 'Failed to generate OpenAPI YAML');
    }
  } else {
    pinoLogger.debug('Skipping OpenAPI YAML generation in production environment');
  }

  const port = Number(process.env.PORT || 3001);

  await app.listen(port, '0.0.0.0');

  pinoLogger.info(`🚀 NestJS listening on 0.0.0.0:${port}`);
  pinoLogger.info(`📍 Application running on http://0.0.0.0:${port}`);
  pinoLogger.info(`📚 Swagger documentation available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
