'use client';

import axios, { AxiosInstance } from 'axios';

/**
 * GDrive ファイル/フォルダ情報 型
 */
export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
  parentId?: string;
}

/**
 * フォルダ内容リスト 型
 */
export interface FolderList {
  items: FileItem[];
  nextPageToken?: string;
}

/**
 * Google Drive API クライアント
 */
export class GDriveClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/',
      withCredentials: true,
      timeout: 10000,
    });
  }

  /**
   * フォルダ内容を取得
   */
  async listFolder(folderId: string = 'root'): Promise<FolderList> {
    try {
      const response = await this.axiosInstance.get<FolderList>(
        '/api/gdrive/list',
        {
          params: { folderId },
        },
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * フォルダ内でキーワード検索
   */
  async search(folderId: string, query: string): Promise<FolderList> {
    try {
      const response = await this.axiosInstance.get<FolderList>(
        '/api/gdrive/search',
        {
          params: { folderId, query },
        },
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any) {
    if (error?.response?.status === 401) {
      console.warn('GDrive API: Unauthorized');
    } else if (error instanceof Error) {
      console.error('GDrive API error:', error.message);
    }
  }
}

export const gdriveClient = new GDriveClient();
