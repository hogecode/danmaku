/**
 * セキュアなトークン保存・読込機能
 * expo-secure-store を使用 (Fallback: AsyncStorage)
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_STORAGE_KEY } from './constants';
import { appLogger } from './logger';

/**
 * SecureStore が利用可能かチェック
 */
const isSecureStoreAvailable = async (): Promise<boolean> => {
  try {
    // Web や Expo Go では SecureStore が使えないため、試してみる
    await SecureStore.getItemAsync('__test_key_');
    return true;
  } catch (error) {
    appLogger.debug('TokenStorage: SecureStore is not available, using AsyncStorage as fallback');
    return false;
  }
};

export class TokenStorage {
  private useSecureStore: boolean | null = null;

  /**
   * ストレージタイプを初期化
   */
  private async initializeStorageType(): Promise<void> {
    if (this.useSecureStore === null) {
      this.useSecureStore = await isSecureStoreAvailable();
      appLogger.debug(
        `TokenStorage: ストレージタイプ = ${this.useSecureStore ? 'SecureStore' : 'AsyncStorage'}`
      );
    }
  }

  /**
   * トークンを保存
   */
  async saveToken(token: string): Promise<void> {
    try {
      await this.initializeStorageType();
      appLogger.info('TokenStorage: トークン保存中...');

      if (this.useSecureStore) {
        await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
      } else {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      }

      appLogger.info('TokenStorage: ✅ トークン保存完了');
    } catch (error) {
      appLogger.error('TokenStorage: トークン保存失敗', error);
      throw error;
    }
  }

  /**
   * トークンを取得
   */
  async getToken(): Promise<string | null> {
    try {
      await this.initializeStorageType();
      appLogger.debug('TokenStorage: トークン取得中...');

      let token: string | null;

      if (this.useSecureStore) {
        token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      } else {
        token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      }

      if (token) {
        appLogger.debug(`TokenStorage: トークン取得成功 (length: ${token.length})`);
      } else {
        appLogger.debug('TokenStorage: トークンなし');
      }

      return token;
    } catch (error) {
      appLogger.error('TokenStorage: トークン取得失敗', error);
      return null;
    }
  }

  /**
   * トークンを削除
   */
  async deleteToken(): Promise<void> {
    try {
      await this.initializeStorageType();
      appLogger.info('TokenStorage: トークン削除中...');

      if (this.useSecureStore) {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      } else {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      appLogger.info('TokenStorage: ✅ トークン削除完了');
    } catch (error) {
      appLogger.error('TokenStorage: トークン削除失敗', error);
      throw error;
    }
  }

  /**
   * トークンが存在するかチェック
   */
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export const tokenStorage = new TokenStorage();
