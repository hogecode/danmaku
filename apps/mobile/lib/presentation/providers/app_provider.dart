import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/data/repositories/danmaku_repository.dart';
import 'package:mobile/data/services/api_service.dart';
import 'package:mobile/data/services/storage_service.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/domain/usecases/fetch_danmaku_usecase.dart';

// ============================================================================
// App Configuration
// ============================================================================

/// アプリケーション設定プロバイダー
class AppConfiguration {
  final String apiBaseUrl;
  const AppConfiguration({
    required this.apiBaseUrl,
  });
}

final appProvider =
    Provider<AppConfiguration>((ref) {
  return AppConfiguration(
    apiBaseUrl:
        AppConstants.apiBaseUrl,
  );
});

// ============================================================================
// Services
// ============================================================================

/// API サービスプロバイダー（シングルトン）
final apiServiceProvider =
    Provider<ApiService>((ref) {
  return ApiService();
});

/// 認証サービスプロバイダー（シングルトン）
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

/// Hiveストレージサービスプロバイダー（シングルトン）
final storageServiceProvider =
    Provider<StorageService>((ref) {
  return StorageService();
});

// ============================================================================
// Repositories
// ============================================================================

/// ダンマクリポジトリプロバイダー
final danmakuRepositoryProvider =
    Provider<DanmakuRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService =
      ref.watch(storageServiceProvider);
  return DanmakuRepository(
    apiService: apiService,
    storageService: storageService,
  );
});

// ============================================================================
// UseCases
// ============================================================================

/// ダンマク取得 UseCase プロバイダー
final fetchDanmakuUseCaseProvider =
    Provider<FetchDanmakuUseCase>((ref) {
  final repository =
      ref.watch(danmakuRepositoryProvider);
  return FetchDanmakuUseCase(repository);
});
