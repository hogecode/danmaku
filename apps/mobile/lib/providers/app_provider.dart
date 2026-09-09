import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/app_ui_provider.dart';
import 'package:mobile/services/storage_service.dart';

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
