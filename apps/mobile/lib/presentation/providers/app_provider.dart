import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/data/repositories/danmaku_repository.dart';
import 'package:mobile/data/services/api_service.dart';
import 'package:mobile/data/services/storage_service.dart';
import 'package:mobile/domain/usecases/fetch_danmaku_usecase.dart';

// ============================================================================
// Services
// ============================================================================

/// API サービスプロバイダー（シングルトン）
// ref.watch(apiServiceProvider);で取得する
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

// Hiveストレージサービスプロバイダー（シングルトン）
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
// 弾幕取得APIを呼び出すためのユースケースを提供するプロバイダーです。
final fetchDanmakuUseCaseProvider = Provider<FetchDanmakuUseCase>((ref) {
  final repository = ref.watch(danmakuRepositoryProvider);
  return FetchDanmakuUseCase(repository);
});
