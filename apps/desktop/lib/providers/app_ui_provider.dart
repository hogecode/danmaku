import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:desktop/services/storage_service.dart';

/// ストレージサービスプロバイダー
/// 
/// main.dart で ProviderScope.overrides を通じて、
/// 初期化済みの StorageService インスタンスが設定される
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});


// ============================================================================
// ダークモード管理
// ============================================================================

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


// ============================================================================
// 言語管理
// ============================================================================

/// 言語状態プロバイダー
final languageProvider =
    StateNotifierProvider<LanguageNotifier, Locale>((ref) {
  final storageService = ref.watch(storageServiceProvider);
  return LanguageNotifier(storageService);
});


/// 言語状態管理クラス
class LanguageNotifier extends StateNotifier<Locale> {
  final StorageService _storageService;

  LanguageNotifier(this._storageService)
      : super(Locale(_storageService.getLanguageCode()));

  /// 言語を変更
  Future<void> setLanguage(String languageCode) async {
    state = Locale(languageCode);
    await _storageService.setLanguageCode(languageCode);
  }

  /// 言語コードを取得
  String getLanguageCode() => state.languageCode;
}
