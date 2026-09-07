import 'dart:convert';
import 'package:logger/logger.dart';
import 'package:mobile/data/client/lib/api.dart';
import 'package:mobile/services/token_bearer_http_client.dart';
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
class AuthService {
  late final ApiClient _apiClient;
  late final AuthApi _authApi;
  late final TokenStorage _tokenStorage;

  AuthService() {
    // TokenStorage 初期化
    _tokenStorage = TokenStorage();

    // プラットフォームに応じてホストを選択
    final basePath = _getServerBasePath();
    _logger.i('AuthService: basePath=$basePath');

    // TokenBearerHttpClient で JWT トークンを自動付与
    final httpClient = TokenBearerHttpClient(_tokenStorage);
    _apiClient = ApiClient(basePath: basePath);
    _apiClient.client = httpClient;
    // Dart/Flutter クライアント であることを明示的に示す
    _apiClient.addDefaultHeader('X-Client-Type', 'flutter');
    
    // Auth API 初期化
    _authApi = AuthApi(_apiClient);
    
    
  }

  /// プラットフォームに応じてサーバーの basePath を取得
  String _getServerBasePath() {
    // すべてのプラットフォームでテストドメインを使用
    return 'http://api.danmaku.cloud:3001';
  }

  /// ログイン処理（OAuth URL 取得）
  /// POST /api/auth/login
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
}
