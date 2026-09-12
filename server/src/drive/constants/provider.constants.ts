/**
 * クラウドストレージプロバイダー定義
 */

export enum ProviderType {
  GOOGLE = 'google',
  ONEDRIVE = 'onedrive',
  // DROPBOX = 'dropbox', // 将来
}

export const PROVIDER_NAMES = {
  [ProviderType.GOOGLE]: 'Google Drive',
  [ProviderType.ONEDRIVE]: 'OneDrive',
} as const;

export const SUPPORTED_PROVIDERS = Object.values(ProviderType);
