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

/**
 * ドライブフォルダ・ファイル閲覧 Controller
 * マルチプロバイダー対応（Google Drive, OneDrive など）
 */
@Controller('api/drive')
@UseGuards(AuthGuard)
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  /**
   * GET /api/drive/list
   * フォルダ内容を取得
   */
  @Get('list')
  async listFolder(
    @Query('folderId') folderId: string = 'root',
    @Session() session: Express.Session & { userId?: string },
  ): Promise<FolderListDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return this.folderService.listFolderContents(BigInt(session.userId), undefined, folderId);
  }

  /**
   * GET /api/drive/search （後方互換性用・Google Drive）
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

    return this.folderService.searchInFolder(
      BigInt(session.userId),
      undefined,
      folderId,
      query,
    );
  }

  /**
   * GET /api/drive/connections/:connectionId/files
   * 特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
   * @param connectionId - ドライブ接続ID
   * @param folderId - フォルダID（デフォルト: 'root'）
   */
  @Get('connections/:connectionId/files')
  async listFolderByConnection(
    @Param('connectionId') connectionId: string,
    @Query('folderId') folderId: string = 'root',
    @Session() session: Express.Session & { userId?: string },
  ): Promise<FolderListDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    return this.folderService.listFolderContents(
      BigInt(session.userId),
      BigInt(connectionId),
      folderId,
    );
  }

  /**
   * GET /api/drive/connections/:connectionId/search
   * 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）
   * @param connectionId - ドライブ接続ID
   * @param folderId - 検索対象フォルダID
   * @param query - 検索キーワード
   */
  @Get('connections/:connectionId/search')
  async searchByConnection(
    @Param('connectionId') connectionId: string,
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

    return this.folderService.searchInFolder(
      BigInt(session.userId),
      BigInt(connectionId),
      folderId,
      query,
    );
  }
}
