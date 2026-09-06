import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:mobile/services/auth_service.dart';

final _logger = Logger();

/// Auth 状態
class AuthState {
  final dynamic? user;
  final bool isAuthenticated;
  final bool loading;
  final String? error;

  AuthState({
    this.user,
    this.isAuthenticated = false,
    this.loading = false,
    this.error,
  });

  /// copyWith
  AuthState copyWith({
    dynamic? user,
    bool? isAuthenticated,
    bool? loading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      loading: loading ?? this.loading,
      error: error ?? this.error,
    );
  }

  /// リセット
  static AuthState reset() => AuthState();
}


/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(AuthState());

  /// ログイン（OAuth URL 取得）
  /// 
  /// POST /api/auth/login
  /// 戻り値: {authorize_url, state, expires_in}
  Future<dynamic> login() async {
    _logger.i('AuthNotifier: ログイン開始');
    state = state.copyWith(loading: true, error: null);
    
    try {
      final result = await _authService.login();
      _logger.i('AuthNotifier: ログインOAuth URL取得成功');
      return result;  // OAuth URL を呼び出し元で処理
    } catch (e) {
      _logger.e('AuthNotifier: ログイン失敗', error: e);
      state = state.copyWith(error: e.toString());
      rethrow;
    } finally {
      state = state.copyWith(loading: false);
    }
  }

  /// ユーザー情報取得
  /// 
  /// OpenAPI: GET /api/auth/me
  /// 戻り値: {id, name, email, picture_url, ...}
  Future<void> fetchUserInfo() async {
    _logger.i('AuthNotifier: ユーザー情報取得開始');
    state = state.copyWith(loading: true, error: null);

    try {
      final user = await _authService.getUserInfo();
      _logger.i('AuthNotifier: ユーザー情報取得成功');
      
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
      );
    } catch (e) {
      _logger.e('AuthNotifier: ユーザー情報取得失敗', error: e);
      state = state.copyWith(error: e.toString());
      rethrow;
    } finally {
      state = state.copyWith(loading: false);
    }
  }

  /// ユーザー情報を直接設定
  /// 
  /// ディープリンク経由でユーザー情報が渡された時に使用
  Future<void> setUserInfo(dynamic userInfo) async {
    _logger.i('AuthNotifier: ユーザー情報を直接設定');
    
    try {
      state = state.copyWith(
        user: userInfo,
        isAuthenticated: true,
      );
      _logger.i('AuthNotifier: ユーザー情報設定成功: ${userInfo["email"]}');
    } catch (e) {
      _logger.e('AuthNotifier: ユーザー情報設定失敗', error: e);
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// OAuth 完了確認
  /// 
  /// ブラウザから戻った時にサーバーのセッションを確認
  /// セッションがあればユーザー情報を取得
  Future<bool> completeOAuth() async {
    _logger.i('AuthNotifier: OAuth 完了確認開始');
    state = state.copyWith(loading: true, error: null);

    try {
      // サーバーからユーザー情報を取得
      final user = await _authService.getUserInfo();
      _logger.i('AuthNotifier: OAuth 完了、ユーザー情報取得成功: ${user["email"]}');
      
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        loading: false,
      );
      
      return true;
    } catch (e) {
      // セッションがない場合やエラーの場合
      _logger.w('AuthNotifier: OAuth 完了確認失敗 (セッションなし)', error: e);
      state = state.copyWith(loading: false);
      return false;
    }
  }

  /// ログアウト
  /// 
  /// OpenAPI: POST /api/auth/logout
  Future<void> logout() async {
    _logger.i('AuthNotifier: ログアウト開始');
    state = state.copyWith(loading: true);

    try {
      await _authService.logout();
      _logger.i('AuthNotifier: ログアウト完了');
    } catch (e) {
      _logger.e('AuthNotifier: ログアウト失敗', error: e);
      state = state.copyWith(error: e.toString());
      rethrow;
    } finally {
      state = AuthState.reset();
    }
  }
}
