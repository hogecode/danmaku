import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';

/**
 * ユーザー設定モジュール
 *
 * ユーザーの設定（テーマ、言語、再生速度、ダンマク設定など）を管理
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
