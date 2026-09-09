import 'package:hive_flutter/hive_flutter.dart';

/// ローカルストレージサービス
/// Hiveを使用してローカルデータを管理
class StorageService {
  static const String _darkModeBox = 'dark_mode';
  static const String _darkModeKey = 'is_dark_mode';
  static const String _languageBox = 'language';
  static const String _languageKey = 'language_code';

  late Box<bool> _darkModeBoxInstance;
  late Box<String> _languageBoxInstance;

  /// ストレージの初期化
  Future<void> initialize() async {
    _darkModeBoxInstance = await Hive.openBox<bool>(_darkModeBox);
    _languageBoxInstance = await Hive.openBox<String>(_languageBox);
  }

  /// ダークモードの状態を取得
  bool getDarkMode() {
    return _darkModeBoxInstance.get(_darkModeKey, defaultValue: false) ?? false;
  }

  /// ダークモードの状態を設定
  Future<void> setDarkMode(bool isDarkMode) async {
    await _darkModeBoxInstance.put(_darkModeKey, isDarkMode);
  }

  /// 言語コードを取得
  String getLanguageCode() {
    return _languageBoxInstance.get(_languageKey, defaultValue: 'ja') ?? 'ja';
  }

  /// 言語コードを設定
  Future<void> setLanguageCode(String languageCode) async {
    await _languageBoxInstance.put(_languageKey, languageCode);
  }

  /// 全データをクリア
  Future<void> clear() async {
    await _darkModeBoxInstance.clear();
    await _languageBoxInstance.clear();
  }
}
