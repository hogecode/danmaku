import { Module } from '@nestjs/common';
import { KakologController } from './kakolog.controller';
import { KakologApiService, KakologCommentService } from './services';

/**
 * Kakolog (2ch実況ログ) ダウンロード Module
 */
@Module({
  controllers: [KakologController],
  providers: [
    KakologApiService,
    KakologCommentService,
  ],
  exports: [
    KakologApiService,
    KakologCommentService,
  ],
})
export class KakologModule {}
