import 'package:hive_flutter/hive_flutter.dart';
import 'package:logger/logger.dart';

/// ローカルストレージサービス（Hive使用）
class StorageService {
  late final Box<dynamic> _box;
  late final Logger _logger;
  static const String _boxName = 'danmaku_app_cache';

  StorageService() {
    _logger = Logger();
  }

  /// 初期化
  Future<void> initialize() async {
    try {
      _box = await Hive.openBox(_boxName);
      _logger.i('StorageService initialized');
    } catch (e) {
      _logger.e('Failed to initialize StorageService', error: e);
      rethrow;
    }
  }

  /// 値を保存
  Future<void> save(String key, dynamic value) async {
    try {
      await _box.put(key, value);
      _logger.d('Saved key: $key');
    } catch (e) {
      _logger.e('Failed to save key: $key', error: e);
      rethrow;
    }
  }

  /// 値を取得
  T? get<T>(String key, [T? defaultValue]) {
    try {
      final value = _box.get(key, defaultValue: defaultValue);
      return value is T ? value : defaultValue;
    } catch (e) {
      _logger.e('Failed to get key: $key', error: e);
      return defaultValue;
    }
  }

  /// キーが存在するか確認
  bool contains(String key) {
    try {
      return _box.containsKey(key);
    } catch (e) {
      _logger.e('Failed to check key: $key', error: e);
      return false;
    }
  }

  /// 値を削除
  Future<void> delete(String key) async {
    try {
      await _box.delete(key);
      _logger.d('Deleted key: $key');
    } catch (e) {
      _logger.e('Failed to delete key: $key', error: e);
      rethrow;
    }
  }

  /// すべてを削除
  Future<void> deleteAll() async {
    try {
      await _box.clear();
      _logger.i('Cleared all cache');
    } catch (e) {
      _logger.e('Failed to clear cache', error: e);
      rethrow;
    }
  }

  /// ボックスを閉じる
  Future<void> close() async {
    try {
      await _box.close();
      _logger.i('StorageService closed');
    } catch (e) {
      _logger.e('Failed to close StorageService', error: e);
    }
  }
}
