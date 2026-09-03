import { Module } from '@nestjs/common';
import { NicovideoController } from './nicovideo.controller';
import { NicovideoVideoService, NicovideoCommentService } from './services';
import { NicovideoApiClient } from './utils/nicovideo-api.client';
import { NicovideCommentFetcher } from './utils/nicovideo-comment.fetcher';
import { NicovideVideoDownloader } from './utils/nicovideo-video.downloader';

/**
 * ニコ動 ダウンロードModule
 * セッション不要 - ログインなしで公開動画情報取得可能
 */
@Module({
  controllers: [NicovideoController],
  providers: [
    NicovideoApiClient,
    NicovideCommentFetcher,
    NicovideVideoDownloader,
    NicovideoVideoService,
    NicovideoCommentService,
  ],
  exports: [
    NicovideoVideoService,
    NicovideoCommentService,
  ],
})
export class NicovideoModule {}
