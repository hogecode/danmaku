import {
  Controller,
  Get,
  Query,
  Session,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { GDriveService } from './gdrive.service';
import { AuthGuard } from '../auth/guards';
import { FolderListDto } from './dto';
import { Express } from 'express';

/**
 * Google Drive フォルダ・ファイル閲覧 Controller
 */
@Controller('api/gdrive')
@UseGuards(AuthGuard)
export class GDriveController {
  constructor(private readonly gdriveService: GDriveService) {}

  /**
   * GET /api/gdrive/list
   * フォルダ内容を取得
   * @param folderId - フォルダID（デフォルト: 'root'）
   */
  @Get('list')
  async listFolder(
    @Query('folderId') folderId: string = 'root',
    @Session() session: Express.Session & { userId?: string },
  ): Promise<FolderListDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return this.gdriveService.listFolderContents(
      BigInt(session.userId),
      folderId,
    );
  }

  /**
   * GET /api/gdrive/search
   * フォルダ内でキーワード検索
   * @param folderId - 検索対象フォルダID
   * @param query - 検索キーワード
   */
  @Get('search')
  async search(
    @Query('folderId') folderId: string,
    @Query('query') query: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<FolderListDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    if (!folderId) {
      throw new BadRequestException('folderId is required');
    }

    return this.gdriveService.searchInFolder(
      BigInt(session.userId),
      folderId,
      query,
    );
  }
}
