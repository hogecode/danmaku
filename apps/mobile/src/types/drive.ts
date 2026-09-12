/**
 * ドライブシステムの型定義
 * 複数のクラウドストレージに対応するための共通インターフェース
 */

export type DriveType = 'gdrive' | 'onedrive';

/**
 * クラウドストレージ内のファイル/フォルダ情報
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  uri?: string;
  isFolder?: boolean;
  modifiedTime?: string;
}

/**
 * ドライブプロバイダーのインターフェース
 * 各クラウドストレージ実装が従うべき共通インターフェース
 */
export interface IDriveProvider {
  // ドライブ情報
  readonly name: string;
  readonly icon: string;
  readonly type: DriveType;

  // 認証関連
  authenticateAsync(): Promise<void>;
  isAuthenticated(): boolean;
  logout(): Promise<void>;

  // ファイル操作
  listFiles(folderId?: string): Promise<DriveFile[]>;
  getFolderInfo(folderId: string): Promise<FolderInfo>;
  getFileInfo(fileId: string): Promise<DriveFile>;
  searchFiles(query: string): Promise<DriveFile[]>;

  // フォルダ操作
  navigateToFolder(folderId: string): void;
  goBack(): void;
  refresh(): Promise<void>;
  getParentFolder(): string | null;
}

/**
 * フォルダ情報
 */
export interface FolderInfo {
  id: string;
  name: string;
  parent?: string;
  childCount: number;
}

/**
 * ドライブセッション情報（複数同時ログイン用）
 */
export interface DriveSession {
  type: DriveType;
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  lastSync?: number;
  error?: string;
}

/**
 * ドライブオプション（UI表示用）
 */
export interface DriveOption {
  type: DriveType;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}
