import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/data/services/storage_service.dart';

/// ストレージサービスプロバイダー
final storageServiceProvider = Provider<StorageService>((ref) {
  throw UnimplementedError(
      'storageServiceProvider must be overridden with a StorageService instance');
});

/// ダークモード状態プロバイダー
final darkModeProvider = StateNotifierProvider<DarkModeNotifier, bool>((ref) {
  final storageService = ref.watch(storageServiceProvider);
  return DarkModeNotifier(storageService);
});

/// ダークモード状態管理クラス
class DarkModeNotifier extends StateNotifier<bool> {
  final StorageService _storageService;

  DarkModeNotifier(this._storageService)
      : super(_storageService.getDarkMode());

  /// ダークモードを切り替え
  Future<void> toggle() async {
    state = !state;
    await _storageService.setDarkMode(state);
  }

  /// ダークモードを設定
  Future<void> setDarkMode(bool isDarkMode) async {
    state = isDarkMode;
    await _storageService.setDarkMode(isDarkMode);
  }
}
