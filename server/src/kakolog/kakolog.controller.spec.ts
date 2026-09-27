import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { KakologController } from './kakolog.controller';
import { KakologCommentService } from './services/kakolog-comment.service';
import { LoggerService } from '../common/logger/logger.service';
import type { KakologComment } from './types/kakolog.types';

describe('KakologController', () => {
  let controller: KakologController;
  let commentService: KakologCommentService;
  let logger: LoggerService;

  const mockComments: KakologComment[] = [
    {
      thread: '1492023606',
      no: 19886,
      vpos: 10,
      date: 1700000000,
      mail: '184',
      userId: 'user123',
      anonymity: 0,
      text: 'テストコメント1',
    },
    {
      thread: '1492023606',
      no: 19887,
      vpos: 20,
      date: 1700000010,
      mail: 'big red ue',
      anonymity: 1,
      text: 'テストコメント2',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KakologController],
      providers: [
        {
          provide: KakologCommentService,
          useValue: {
            fetchComments: jest.fn(),
            convertToDPlayerFormat: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<KakologController>(KakologController);
    commentService = module.get<KakologCommentService>(KakologCommentService);
    logger = module.get<LoggerService>(LoggerService);
  });

  describe('downloadComments', () => {
    it('チャンネルIDが未指定の場合、エラーを返す', async () => {
      const dto = {
        channelId: '',
        startTime: 1700000000,
        endTime: 1700000100,
      };

      await expect(controller.downloadComments(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('startTime >= endTime の場合、エラーを返す', async () => {
      const dto = {
        channelId: 'CH321',
        startTime: 1700000100,
        endTime: 1700000000,
      };

      await expect(controller.downloadComments(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('正常にコメントを取得して返す', async () => {
      const dto = {
        channelId: 'CH321',
        startTime: 1700000000,
        endTime: 1700000100,
      };

      const mockDPlayerComments = [
        {
          time: 10,
          type: 'normal' as const,
          size: 'medium' as const,
          color: '184',
          author: 'user123',
          text: 'テストコメント1',
        },
        {
          time: 20,
          type: 'top' as const,
          size: 'big' as const,
          color: 'red',
          author: null,
          text: 'テストコメント2',
        },
      ];

      jest
        .spyOn(commentService, 'fetchComments')
        .mockResolvedValueOnce(mockComments);
      jest
        .spyOn(commentService, 'convertToDPlayerFormat')
        .mockReturnValueOnce(mockDPlayerComments);

      const result = await controller.downloadComments(dto);

      expect(result.status).toBe('completed');
      expect(result.channelId).toBe('CH321');
      expect(result.commentCount).toBe(2);
      expect(result.retrievedCount).toBe(2);
      expect(result.comments).toHaveLength(2);
    });
  });
});
