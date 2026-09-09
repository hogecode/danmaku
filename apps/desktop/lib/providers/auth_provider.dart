import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:desktop/core/logger/app_logger.dart';
import 'package:desktop/services/auth_service.dart';
import 'package:desktop/services/token_storage.dart';

/// Auth State
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

/// Auth Service プロバイダー
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});


/// Auth 状態 + アクション
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final TokenStorage _tokenStorage;

  AuthNotifier(this._authService, [TokenStorage? tokenStorage])
      : _tokenStorage = tokenStorage ?? TokenStorage(),
        super(AuthState());

  /// 初期化
  Future<void> initialize() async {
    final token = await _tokenStorage.getToken();
    if (token != null) {
      await fetchUserInfo();
    }
  }

  /// ログイン（OAuth URL 取得）
  ///
  /// POST /api/auth/login
  /// 戻り値: {authorize_url, state, expires_in}
  Future<dynamic> login() async {
    state = state.copyWith(loading: true, error: null);

    try {
      final result = await _authService.login();
      return result; // OAuth URL を呼び出し元で処理
    } catch (e) {
      appLogger.error('AuthNotifier: ログイン失敗', e);
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
    state = state.copyWith(loading: true, error: null);

    try {
      final user = await _authService.getUserInfo();

      state = state.copyWith(
        user: user,
        isAuthenticated: true,
      );
    } catch (e) {
      appLogger.error('AuthNotifier: ユーザー情報取得失敗', e);
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
    try {
      state = state.copyWith(
        user: userInfo,
        isAuthenticated: true,
      );
    } catch (e) {
      appLogger.error('AuthNotifier: ユーザー情報設定失敗', e);
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }

  /// OAuth 完了確認
  ///
  /// ブラウザから戻った時にサーバーのセッションを確認
  /// セッションがあればユーザー情報を取得
  Future<bool> completeOAuth() async {
    state = state.copyWith(loading: true, error: null);

    try {
      // サーバーからユーザー情報を取得
      final user = await _authService.getUserInfo();

      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        loading: false,
      );

      return true;
    } catch (e) {
      // セッションがない場合やエラーの場合
      appLogger.warning('AuthNotifier: ⛔ OAuth 完了確認失敗 (セッションなし または エラー)', e);
      state = state.copyWith(loading: false);
      return false;
    }
  }

  /// ログアウト
  ///
  /// OpenAPI: POST /api/auth/logout
  Future<void> logout() async {
    appLogger.info('AuthNotifier: ログアウト開始');
    state = state.copyWith(loading: true);

    try {
      await _authService.logout();
      await _tokenStorage.deleteToken();
      appLogger.info('AuthNotifier: ログアウト完了');
    } catch (e) {
      appLogger.error('AuthNotifier: ログアウト失敗', e);
      state = state.copyWith(error: e.toString());
      rethrow;
    } finally {
      state = AuthState.reset();
    }
  }

  /// トークンとユーザー情報を保存（ディープリンク経由）
  ///
  /// ディープリンクからトークンを受け取り、SecureStorage に保存
  /// @param userInfo ユーザー情報
  /// @param token JWT アクセストークン
  Future<void> saveTokenAndSetUser(dynamic userInfo, String token) async {
    appLogger.info('AuthNotifier: ==================== トークンとユーザー情報を保存 ====================');
    state = state.copyWith(loading: true, error: null);

    try {
      appLogger.info('AuthNotifier: トークンを SecureStorage に保存中...');
      await _tokenStorage.saveToken(token);
      appLogger.info('AuthNotifier: ✅ トークン保存完了');

      state = state.copyWith(
        user: userInfo,
        isAuthenticated: true,
        loading: false,
      );

      appLogger.info('AuthNotifier: 🎉 AuthState を更新完了 (isAuthenticated=true)');
    } catch (e) {
      appLogger.error('AuthNotifier: ⛔ トークン保存失敗', e);
      state = state.copyWith(error: e.toString(), loading: false);
      rethrow;
    }
  }
}


