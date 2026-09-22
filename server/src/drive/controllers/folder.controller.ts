import {
  Controller,
  Get,
  Param,
  Query,
  Session,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FolderService } from '../services/folder.service';
import { AuthGuard } from '../../auth/guards';
import { FolderListDto } from '../dto';
import { Express } from 'express';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * ドライブフォルダ・ファイル閲覧 Controller
 * マルチプロバイダー対応（Google Drive, OneDrive など）
 */
@Controller('api/drive')
@UseGuards(AuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * GET /api/drive/connections/:connectionId/files
   * 
   * 特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
   */
  @Get('connections/:connectionId/files')
  async listFolderByConnection(
    @Param('connectionId') connectionId: string,
    @Query('folderId') folderId: string = 'root',
    @Session() session: Express.Session & { userId?: string },
  ): Promise<FolderListDto> {
    try {
      if (!session.userId) {
        throw new BadRequestException('User ID not found in session');
      }

      this.logger.debug('[FOLDER] listFolderByConnection', {
        userId: session.userId,
        connectionId,
        folderId,
      });

      const result = await this.folderService.listFolderContents(
        BigInt(session.userId),
        BigInt(connectionId),
        folderId,
      );

      this.logger.debug('[FOLDER] listFolderByConnection success', {
        userId: session.userId,
        connectionId,
        itemCount: result.items?.length || 0,
      });

      return result;
    } catch (error) {
      this.logger.error('[FOLDER] listFolderByConnection error', error as Error, {
        userId: session.userId,
        connectionId,
        folderId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * GET /api/drive/connections/:connectionId/search
   * 
   * 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）
   */
  @Get('connections/:connectionId/search')
  async searchByConnection(
    @Param('connectionId') connectionId: string,
    @Query('folderId') folderId: string,
    @Query('query') query: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<FolderListDto> {
    try {
      if (!session.userId) {
        throw new BadRequestException('User ID not found in session');
      }

      if (!folderId) {
        throw new BadRequestException('folderId is required');
      }

      this.logger.debug('[FOLDER] searchByConnection', {
        userId: session.userId,
        connectionId,
        folderId,
        query,
      });

      const result = await this.folderService.searchInFolder(
        BigInt(session.userId),
        BigInt(connectionId),
        folderId,
        query,
      );

      this.logger.debug('[FOLDER] searchByConnection success', {
        userId: session.userId,
        connectionId,
        query,
        itemCount: result.items?.length || 0,
      });

      return result;
    } catch (error) {
      this.logger.error('[FOLDER] searchByConnection error', error as Error, {
        userId: session.userId,
        connectionId,
        folderId,
        query,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
