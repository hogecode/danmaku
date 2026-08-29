import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/data/repositories/danmaku_repository.dart';
import 'package:flutter_app/data/services/api_service.dart';
import 'package:flutter_app/data/services/storage_service.dart';
import 'package:flutter_app/domain/usecases/fetch_danmaku_usecase.dart';

// ============================================================================
// Services
// ============================================================================

/// API サービスプロバイダー（シングルトン）
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

/// ストレージサービスプロバイダー（シングルトン）
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

// ============================================================================
// Repositories
// ============================================================================

/// ダンマクリポジトリプロバイダー
final danmakuRepositoryProvider = Provider<DanmakuRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return DanmakuRepository(
    apiService: apiService,
    storageService: storageService,
  );
});

// ============================================================================
// UseCases
// ============================================================================

/// ダンマク取得 UseCase プロバイダー
final fetchDanmakuUseCaseProvider = Provider<FetchDanmakuUseCase>((ref) {
  final repository = ref.watch(danmakuRepositoryProvider);
  return FetchDanmakuUseCase(repository);
});
