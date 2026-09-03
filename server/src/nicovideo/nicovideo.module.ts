import { Module } from '@nestjs/common';
import { NicovideoController } from './nicovideo.controller';
import { NicovideoVideoService, NicovideoCommentService } from './services';
import { NicovideoApiClient } from './utils/nicovideo-api.client';
import { NicovideoCommentFetcher } from './utils/nicovideo-comment.fetcher';
import { NicovideoVideoDownloader } from './utils/nicovideo-video.downloader';

/**
 * ニコ動 ダウンロードModule
 * セッション不要 - ログインなしで公開動画情報取得可能
 */
@Module({
  controllers: [NicovideoController],
  providers: [
    NicovideoApiClient,
    NicovideoCommentFetcher,
    NicovideoVideoDownloader,
    NicovideoVideoService,
    NicovideoCommentService,
  ],
  exports: [
    NicovideoVideoService,
    NicovideoCommentService,
  ],
})
export class NicovideoModule {}
