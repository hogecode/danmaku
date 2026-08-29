import { Module } from '@nestjs/common';
import { GDriveController } from './gdrive.controller';
import { GDriveService } from './gdrive.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

/**
 * Google Drive フォルダ・ファイル閲覧 Module
 */
@Module({
  imports: [DatabaseModule, AuthModule, RedisModule],
  controllers: [GDriveController],
  providers: [GDriveService],
  exports: [GDriveService],
})
export class GDriveModule {}
