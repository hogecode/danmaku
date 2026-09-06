import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';

final _logger = Logger();

/// JWT トークンを SecureStorage に保存・読み込むサービス
class TokenStorage {
  static const String _tokenKey = 'auth_access_token';
  
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  /// トークンを保存
  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
      _logger.i('[TokenStorage] トークンを保存しました');
    } catch (e) {
      _logger.e('[TokenStorage] トークン保存失敗', error: e);
      rethrow;
    }
  }
  
  /// トークンを読み込む
  Future<String?> getToken() async {
    try {
      final token = await _storage.read(key: _tokenKey);
      if (token != null) {
        _logger.i('[TokenStorage] トークンを読み込みました');
      } else {
        _logger.w('[TokenStorage] トークンが保存されていません');
      }
      return token;
    } catch (e) {
      _logger.e('[TokenStorage] トークン読み込み失敗', error: e);
      return null;
    }
  }
  
  /// トークンを削除（ログアウト時など）
  Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _tokenKey);
      _logger.i('[TokenStorage] トークンを削除しました');
    } catch (e) {
      _logger.e('[TokenStorage] トークン削除失敗', error: e);
    }
  }
  
  /// トークンが存在するか確認
  Future<bool> hasToken() async {
    try {
      final token = await getToken();
      return token != null && token.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}
