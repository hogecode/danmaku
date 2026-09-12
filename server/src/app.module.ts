import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { DriveModule } from './drive/drive.module';
import { PlayerModule } from './player/player.module';
import { CommonModule } from './common/common.module';
import { NicovideoModule } from './nicovideo/nicovideo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CommonModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    DriveModule,
    PlayerModule,
    NicovideoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
