import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { XmlParser } from './xml-parser';

describe('XmlParser', () => {
  let service: XmlParser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmlParser],
    }).compile();

    service = module.get<XmlParser>(XmlParser);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseJsonComments', () => {
    it('should parse valid JSON comments', () => {
      const jsonContent = JSON.stringify([
        {
          thread: '1492023606',
          no: 19886,
          vpos: 0,
          date: 1492100460,
          mail: '184',
          user_id: 'user123',
          premium: 1,
          anonymity: 1,
          text: 'テストコメント',
        },
      ]);

      const result = service.parseJsonComments(jsonContent);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        thread: '1492023606',
        no: 19886,
        vpos: 0,
        date: 1492100460,
        mail: '184',
        user_id: 'user123',
        premium: 1,
        anonymity: 1,
        text: 'テストコメント',
      });
    });

    it('should throw error for non-array JSON', () => {
      const jsonContent = JSON.stringify({
        comments: [{ text: 'test' }],
      });

      expect(() => service.parseJsonComments(jsonContent)).toThrow(
        BadRequestException,
      );
    });

    it('should throw error for invalid JSON', () => {
      const jsonContent = 'invalid json{';

      expect(() => service.parseJsonComments(jsonContent)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseXmlComments', () => {
    it('should parse valid XML comments', async () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<packet>
  <chat thread="1492023606" no="19886" vpos="0" date="1492100460" mail="184" user_id="SlF_cF2J1CdotJTaojvbM9mDYAE" premium="1" anonymity="1">テストコメント</chat>
</packet>`;

      const result = await service.parseXmlComments(xmlContent);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        thread: '1492023606',
        no: 19886,
        vpos: 0,
        date: 1492100460,
        mail: '184',
        user_id: 'SlF_cF2J1CdotJTaojvbM9mDYAE',
        premium: 1,
        anonymity: 1,
        text: 'テストコメント',
      });
    });

    it('should handle multiple XML comments', async () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<packet>
  <chat thread="1492023606" no="19886" vpos="0" date="1492100460" mail="184" user_id="user1">コメント1</chat>
  <chat thread="1492023606" no="19883" vpos="6" date="1492100460" mail="184 big ue" user_id="user2">コメント2</chat>
</packet>`;

      const result = await service.parseXmlComments(xmlContent);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('コメント1');
      expect(result[1].text).toBe('コメント2');
    });

    it('should throw error for invalid XML', async () => {
      const xmlContent = '<packet><chat>unclosed tag</packet>';

      await expect(service.parseXmlComments(xmlContent)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseCommentFile', () => {
    it('should parse JSON by MIME type', async () => {
      const jsonContent = JSON.stringify([
        {
          thread: '1492023606',
          no: 19886,
          vpos: 0,
          date: 1492100460,
          text: 'テストコメント',
        },
      ]);

      const result = await service.parseCommentFile(
        jsonContent,
        'application/json',
      );

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('テストコメント');
    });

    it('should parse XML by MIME type', async () => {
      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<packet>
  <chat thread="1492023606" no="19886" vpos="0" date="1492100460">テストコメント</chat>
</packet>`;

      const result = await service.parseCommentFile(xmlContent, 'text/xml');

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('テストコメント');
    });

    it('should throw error for unsupported MIME type', async () => {
      const content = 'some content';

      await expect(
        service.parseCommentFile(content, 'text/plain'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
