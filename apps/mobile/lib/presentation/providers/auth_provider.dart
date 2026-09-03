import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/domain/entities/user_entity.dart';
import 'package:mobile/presentation/providers/app_provider.dart';

// ============================================================================
// Auth State Providers
// ============================================================================

/// 現在のユーザープロバイダー
final currentUserProvider =
    StateProvider<UserEntity?>((ref) => null);

/// ログイン状態プロバイダー
final isAuthenticatedProvider =
    StateProvider<bool>((ref) => false);

/// 認証ローディング状態プロバイダー
final authLoadingProvider =
    StateProvider<bool>((ref) => false);

/// ログインレスポンス（OAuth URL と state）
final loginResponseProvider =
    StateProvider<({String url, String state, int expiresIn})?>((ref) =>
        null);

// ============================================================================
// Auth Actions (シンプル非同期アクション)
// ============================================================================

/// ログイン処理（OAuth URL を返す）
final loginProvider =
    FutureProvider<({String url, String state})>((ref) async {
  final authService =
      ref.watch(authServiceProvider);

  final response =
      await authService.login();
  return (
    url: response.authorizeUrl,
    state: response.state
  );
});

/// ユーザー情報取得（ユーザー状態を更新）
final fetchUserProvider =
    FutureProvider<UserEntity>((ref) async {
  final authService =
      ref.watch(authServiceProvider);

  final userModel =
      await authService.getUserInfo();
  final user = userModel.toEntity();

  // StateProvider を別途更新
  // （ref.read は使わない）
  return user;
});

/// ログアウト処理
final logoutProvider =
    FutureProvider<void>((ref) async {
  final authService =
      ref.watch(authServiceProvider);

  await authService.logout();
});
