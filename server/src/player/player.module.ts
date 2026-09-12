import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { XmlParser } from './utils/xml-parser';
import { CommentConverter } from './utils/comment-converter';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { DriveModule } from '../drive/drive.module';

/**
 * プレイヤー Module
 * 動画ストリーミング とコメント機能を提供
 */
@Module({
  imports: [DatabaseModule, AuthModule, DriveModule],
  controllers: [PlayerController],
  providers: [PlayerService, XmlParser, CommentConverter],
  exports: [PlayerService],
})
export class PlayerModule {}
