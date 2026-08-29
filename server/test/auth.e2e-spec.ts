import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('ログイン開始リクエストが成功', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('authorize_url');
          expect(res.body).toHaveProperty('state');
          expect(res.body).toHaveProperty('expires_in');
          expect(res.body.authorize_url).toContain('accounts.google.com');
        });
    });

    it('複数回呼び出しで異なるstate を返す', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .expect(200);

      const res2 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .expect(200);

      expect(res1.body.state).not.toBe(res2.body.state);
    });
  });

  describe('Rate Limiting', () => {
    it('6回目のリクエストが拒否される', async () => {
      // 最初の5回は成功
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .expect(200);
      }

      // 6回目は拒否
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .expect(429);
    });
  });

  describe('GET /api/auth/me (without auth)', () => {
    it('未認証の場合、401 を返す', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('GET /api/auth/callback', () => {
    it('エラーパラメータがある場合、400 を返す', () => {
      return request(app.getHttpServer())
        .get('/api/auth/callback')
        .query({
          error: 'access_denied',
          error_description: 'User denied access',
        })
        .expect(400);
    });

    it('code がない場合、400 を返す', () => {
      return request(app.getHttpServer())
        .get('/api/auth/callback')
        .query({
          state: 'state123',
        })
        .expect(400);
    });

    it('state がない場合、400 を返す', () => {
      return request(app.getHttpServer())
        .get('/api/auth/callback')
        .query({
          code: 'code123',
        })
        .expect(400);
    });

    it('invalid state で 400 を返す', () => {
      return request(app.getHttpServer())
        .get('/api/auth/callback')
        .query({
          code: 'code123',
          state: 'invalid-state',
        })
        .expect(400);
    });
  });
});
