import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlayerService } from './player.service';
import { TokenService } from '../auth/services';
import { XmlParser } from './utils/xml-parser';

describe('PlayerService', () => {
  let service: PlayerService;
  let tokenService: TokenService;
  let xmlParser: XmlParser;

  const mockTokenService = {
    getValidAccessToken: jest.fn(),
  };

  const mockXmlParser = {
    parseCommentFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: XmlParser,
          useValue: mockXmlParser,
        },
        {
          provide: 'DATABASE_CONNECTION',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    tokenService = module.get<TokenService>(TokenService);
    xmlParser = module.get<XmlParser>(XmlParser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseRangeHeader', () => {
    // Private メソッドをテストするためにリフレクションを使用
    const parseRange = (rangeHeader: string, fileSize: number) => {
      return (service as any).parseRangeHeader(rangeHeader, fileSize);
    };

    it('should parse bytes=0-1023 format', () => {
      const result = parseRange('bytes=0-1023', 10000);
      expect(result).toEqual({ start: 0, end: 1023, size: 10000 });
    });

    it('should parse bytes=1024- format', () => {
      const result = parseRange('bytes=1024-', 10000);
      expect(result).toEqual({ start: 1024, end: 9999, size: 10000 });
    });

    it('should parse bytes=-512 format (last N bytes)', () => {
      const result = parseRange('bytes=-512', 10000);
      expect(result).toEqual({ start: 9488, end: 9999, size: 10000 });
    });

    it('should return null for invalid format', () => {
      const result = parseRange('invalid', 10000);
      expect(result).toBeNull();
    });

    it('should return null when start > end', () => {
      const result = parseRange('bytes=2000-1000', 10000);
      expect(result).toBeNull();
    });

    it('should return null when start >= fileSize', () => {
      const result = parseRange('bytes=10000-', 10000);
      expect(result).toBeNull();
    });

    it('should return null when end >= fileSize', () => {
      const result = parseRange('bytes=0-10000', 10000);
      expect(result).toBeNull();
    });

    it('should return null when lastBytes <= 0', () => {
      const result = parseRange('bytes=-0', 10000);
      expect(result).toBeNull();
    });

    it('should handle edge case: bytes=0-0', () => {
      const result = parseRange('bytes=0-0', 10000);
      expect(result).toEqual({ start: 0, end: 0, size: 10000 });
    });

    it('should handle edge case: bytes=9999-9999 (last byte)', () => {
      const result = parseRange('bytes=9999-9999', 10000);
      expect(result).toEqual({ start: 9999, end: 9999, size: 10000 });
    });
  });
});
