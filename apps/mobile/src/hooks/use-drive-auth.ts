/**
 * 複数のクラウドストレージの認証状態を管理（Zustand を使用）
 * 各ドライブの認証状態を個別に保持し、同時ログインをサポート
 */

import { useMemo } from 'react';
import { useDriveAuthStore } from '@/stores/drive-auth-store';
import type { DriveType } from '@/types/drive';
import { appLogger } from '@/utils/logger';

export function useDriveAuth() {
  // Zustand ストアから必要な状態とメソッドを取得
  const {
    sessions,
    currentDriveType,
    setSessionAuthenticated,
    setSessionUser,
    setSessionError,
    setCurrentDriveType,
    isAuthenticated,
    hasAnyAuthenticated,
    getAllAuthenticatedDrives,
    logoutDrive,
    logoutAll,
    reset,
  } = useDriveAuthStore();

  /**
   * 認証済みのドライブリストをメモ化
   */
  const authenticatedDrives = useMemo(
    () => getAllAuthenticatedDrives(),
    [getAllAuthenticatedDrives]
  );

  /**
   * 指定されたドライブにログイン（状態管理）
   * 実際の認証処理は各 Hook（useDrive, useOneDrive）で行う
   */
  const loginDrive = (driveType: DriveType) => {
    appLogger.info(`[useDriveAuth] ${driveType} ログイン開始`);
    setSessionAuthenticated(driveType, true);
    setCurrentDriveType(driveType);
  };

  /**
   * 指定されたドライブからログアウト
   */
  const logoutDriveAuth = (driveType: DriveType) => {
    appLogger.info(`[useDriveAuth] ${driveType} からログアウト`);
    logoutDrive(driveType);
  };

  return {
    // 状態
    sessions,
    currentDriveType,
    authenticatedDrives,

    // メソッド
    loginDrive,
    logoutDriveAuth,
    logoutAll,
    setSessionUser,
    setSessionError,
    setCurrentDriveType,
    isAuthenticated,
    hasAnyAuthenticated,
    reset,
  };
}
