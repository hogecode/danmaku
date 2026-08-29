import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';

describe('TokenService', () => {
  let service: TokenService;
  let configService: ConfigService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      query: {
        oauthAccounts: {
          findFirst: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                GOOGLE_CLIENT_ID: 'test-client-id',
                GOOGLE_CLIENT_SECRET: 'test-client-secret',
                GOOGLE_REDIRECT_URI: 'http://localhost:3001/api/auth/callback',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('calculateTokenExpiration', () => {
    it('現在時刻 + expiresIn で有効期限を計算', () => {
      const before = Date.now();
      const expiresIn = 3600;
      const expiration = service.calculateTokenExpiration(expiresIn);
      const after = Date.now();

      const expectedTime = before + expiresIn * 1000;
      const expectedTimeAfter = after + expiresIn * 1000;

      expect(expiration.getTime()).toBeGreaterThanOrEqual(expectedTime);
      expect(expiration.getTime()).toBeLessThanOrEqual(expectedTimeAfter);
    });

    it('expiresIn が 0 の場合、ほぼ現在時刻を返す', () => {
      const before = Date.now();
      const expiration = service.calculateTokenExpiration(0);
      const after = Date.now();

      expect(expiration.getTime()).toBeGreaterThanOrEqual(before);
      expect(expiration.getTime()).toBeLessThanOrEqual(after + 1000);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('5分以内に期限切れの場合、true を返す', () => {
      const expiresAt = new Date(Date.now() + 4 * 60 * 1000);
      expect(service.isTokenExpiringSoon(expiresAt)).toBe(true);
    });

    it('5分以上に期限切れの場合、false を返す', () => {
      const expiresAt = new Date(Date.now() + 6 * 60 * 1000);
      expect(service.isTokenExpiringSoon(expiresAt)).toBe(false);
    });

    it('既に期限切れの場合、true を返す', () => {
      const expiresAt = new Date(Date.now() - 1000);
      expect(service.isTokenExpiringSoon(expiresAt)).toBe(true);
    });

    it('ちょうど 5 分の場合、false を返す', () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      expect(service.isTokenExpiringSoon(expiresAt)).toBe(false);
    });
  });
});
