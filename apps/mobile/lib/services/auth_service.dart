import 'dart:convert';
import 'package:logger/logger.dart';
import 'package:mobile/data/client/lib/api.dart';
import 'package:mobile/services/token_storage.dart';

final _logger = Logger();

/// 認証エラー
class AuthException implements Exception {
  final String message;
  final int? statusCode;

  AuthException(this.message, [this.statusCode]);

  @override
  String toString() => 'AuthException: $message (status: $statusCode)';
}


/// 認証サービス
/// 
/// OpenAPI 自動生成クライアントを使用
/// モデルは OpenAPI 生成コード（dynamic）を直接使用
class AuthService {
  late final ApiClient _apiClient;
  late final AuthApi _authApi;
  late final TokenStorage _tokenStorage;

  AuthService() {
    // OpenAPI クライアント初期化
    // プラットフォームに応じてホストを選択
    final basePath = _getServerBasePath();
    _logger.i('AuthService: basePath=$basePath');
    
    _apiClient = ApiClient(basePath: basePath);
    // Dart/Flutter クライアント であることを明示的に示す
    _apiClient.addDefaultHeader('X-Client-Type', 'flutter');
    
    // Auth API 初期化
    _authApi = AuthApi(_apiClient);
    
    // TokenStorage 初期化
    _tokenStorage = TokenStorage();
  }

  /// プラットフォームに応じてサーバーの basePath を取得
  String _getServerBasePath() {
    // すべてのプラットフォームでテストドメインを使用
    return 'http://api.danmaku.cloud:3001';
  }

  /// ログイン処理（OAuth URL 取得）
  /// 
  /// OpenAPI: POST /api/auth/login
  /// → {authorize_url, state, expires_in}
  Future<dynamic> login() async {
    try {
      _logger.i('AuthService: ログイン開始');

      // OpenAPI で POST /api/auth/login を呼び出し
      final response = await _authApi.authControllerLoginWithHttpInfo();

      // ステータスコード確認
      if (response.statusCode == null || response.statusCode! >= 400) {
        throw AuthException(
          'Login failed',
          response.statusCode,
        );
      }

      // レスポンスボディをJSON デコード
      if (response.body.isEmpty) {
        throw AuthException('No data received from login endpoint');
      }

      final data = jsonDecode(response.body);
      _logger.i('AuthService: ログイン成功');
      return data;
    } catch (e) {
      _logger.e('AuthService: ログイン失敗', error: e);
      rethrow;
    }
  }

  /// ユーザー情報取得
  /// 
  /// OpenAPI: GET /api/auth/me
  /// → {id, name, email, picture_url, ...}
  Future<dynamic> getUserInfo() async {
    try {
      _logger.i('AuthService: ユーザー情報取得開始 (OpenAPI)');

      // OpenAPI で GET /api/auth/me を呼び出し
      final response = await _authApi.authControllerGetUserInfoWithHttpInfo();

      // ステータスコード確認
      if (response.statusCode == null || response.statusCode! >= 400) {
        throw AuthException(
          'Get user info failed',
          response.statusCode,
        );
      }

      // レスポンスボディをJSON デコード
      if (response.body.isEmpty) {
        throw AuthException('No data received from user info endpoint');
      }

      final data = jsonDecode(response.body);
      _logger.i('AuthService: ユーザー情報取得成功');
      return data;
    } catch (e) {
      _logger.e('AuthService: ユーザー情報取得失敗', error: e);
      rethrow;
    }
  }

  /// ログアウト
  /// 
  /// OpenAPI: POST /api/auth/logout
  Future<void> logout() async {
    try {
      _logger.i('AuthService: ログアウト開始 (OpenAPI)');

      // OpenAPI で POST /api/auth/logout を呼び出し
      final response = await _authApi.authControllerLogoutWithHttpInfo();

      // ステータスコード確認
      if (response.statusCode == null || response.statusCode! >= 400) {
        throw AuthException(
          'Logout failed',
          response.statusCode,
        );
      }

      _logger.i('AuthService: ログアウト完了');
    } catch (e) {
      _logger.e('AuthService: ログアウト失敗', error: e);
      rethrow;
    }
  }

  /// JWT アクセストークンを保存
  /// 
  /// ディープリンク経由で受け取ったトークンを SecureStorage に保存
  /// @param token JWT アクセストークン
  Future<void> saveToken(String token) async {
    try {
      _logger.i('AuthService: トークンを保存中...');
      await _tokenStorage.saveToken(token);
      _logger.i('AuthService: ✅ トークン保存完了');
    } catch (e) {
      _logger.e('AuthService: ⛔ トークン保存失敗', error: e);
      rethrow;
    }
  }

  /// JWT アクセストークンを取得
  /// 
  /// SecureStorage から保存されたトークンを取得
  /// @return トークン文字列、または null（保存されていない場合）
  Future<String?> getToken() async {
    try {
      _logger.i('AuthService: トークンを取得中...');
      final token = await _tokenStorage.getToken();
      if (token != null) {
        _logger.i('AuthService: ✅ トークン取得完了');
      } else {
        _logger.w('AuthService: ⚠️ トークンが保存されていません');
      }
      return token;
    } catch (e) {
      _logger.e('AuthService: ⛔ トークン取得失敗', error: e);
      return null;
    }
  }

  /// トークンを削除（ログアウト時）
  Future<void> deleteToken() async {
    try {
      _logger.i('AuthService: トークンを削除中...');
      await _tokenStorage.deleteToken();
      _logger.i('AuthService: ✅ トークン削除完了');
    } catch (e) {
      _logger.e('AuthService: ⛔ トークン削除失敗', error: e);
      rethrow;
    }
  }

  /// トークンが保存されているか確認
  Future<bool> hasToken() async {
    try {
      return await _tokenStorage.hasToken();
    } catch (e) {
      _logger.e('AuthService: ⛔ トークン確認失敗', error: e);
      return false;
    }
  }
}
