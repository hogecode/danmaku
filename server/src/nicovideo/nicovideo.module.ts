import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NicovideoController } from './nicovideo.controller';
import {
  NicovideoVideoService,
  NicovideoCommentService,
  NicovideoDownloadService,
  NicovideoStorageService,
} from './services';
import { NicovideoApiClient } from './utils/nicovideo-api.client';
import { NicovideoCommentFetcher } from './utils/nicovideo-comment.fetcher';
import { NicovideoDownloadProcessor } from './queues/nicovideo-download.processor';
import { NicovideoSSEService } from './nicovideo-sse.service';

/**
 * ニコ動 ダウンロードModule
 * BullMQ キュー + SSE対応
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'nicovideo-download',
    }),
  ],
  controllers: [NicovideoController],
  providers: [
    NicovideoApiClient,
    NicovideoCommentFetcher,
    NicovideoVideoService,
    NicovideoCommentService,
    NicovideoDownloadService,
    NicovideoStorageService,
    NicovideoDownloadProcessor,
    NicovideoSSEService,
  ],
  exports: [
    NicovideoVideoService,
    NicovideoCommentService,
    NicovideoDownloadService,
    NicovideoStorageService,
    NicovideoSSEService,
  ],
})
export class NicovideoModule {}
