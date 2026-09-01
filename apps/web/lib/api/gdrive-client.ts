'use client';

import { Configuration, GDriveApi } from '../generated';
import axios from 'axios';

/**
 * GDrive API クライアント
 */
export class GDriveClient {
  private gdriveApi: GDriveApi;

  constructor() {
    const configuration = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
      baseOptions: {
        withCredentials: true,
      },
    });

    this.gdriveApi = new GDriveApi(configuration);
  }

  /**
   * フォルダの内容を取得
   */
  async fetchFolderContents(folderId: string) {
    try {
      const response = await this.gdriveApi.gDriveControllerListFolder(folderId);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * ファイル・フォルダを検索
   */
  async searchFiles(folderId: string, query: string) {
    try {
      const response = await this.gdriveApi.gDriveControllerSearch(folderId, query);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any) {
    if (error?.response?.status === 401) {
      console.warn('Unauthorized. Please login again.');
    } else if (error instanceof Error) {
      console.error('GDrive error:', error.message);
    }
  }
}

export const gdriveClient = new GDriveClient();

/**
 * フォルダの内容を取得（スタンドアロン関数）
 */
export async function fetchFolderContents(folderId: string) {
  return gdriveClient.fetchFolderContents(folderId);
}

/**
 * ファイル・フォルダを検索（スタンドアロン関数）
 */
export async function searchFiles(query: string, folderId?: string) {
  return gdriveClient.searchFiles(query, folderId);
}
