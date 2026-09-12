import { Module } from '@nestjs/common';
import { DriveConnectionController } from './controllers/drive-connection.controller';
import { FolderController } from './controllers/folder.controller';
import { DriveService } from './services/drive.service';
import { DriveConnectionService } from './services/drive-connection.service';
import { FolderService } from './services/folder.service';
import { GoogleDriveProvider, OnedriveProvider } from './providers';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, RedisModule, AuthModule],
  controllers: [DriveConnectionController, FolderController],
  providers: [
    DriveService,
    DriveConnectionService,
    FolderService,
    GoogleDriveProvider,
    OnedriveProvider,
  ],
  exports: [
    DriveService,
    DriveConnectionService,
    FolderService,
    GoogleDriveProvider,
    OnedriveProvider,
  ],
})
export class DriveModule {}

