import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';
import 'package:mobile/pages/auth/login_page.dart';
import 'package:mobile/pages/auth/auth_callback_page.dart';
import 'package:mobile/pages/home_page_go.dart';
import 'package:mobile/pages/drive_page.dart';
import 'package:mobile/pages/player_page.dart';
import 'package:mobile/providers/auth_provider.dart';

final _logger = Logger();

/// ============================================================================
/// ルート定義
/// ============================================================================

class Routes {
  static const String home = '/';
  static const String login = '/login';
  static const String authCallback = '/auth/callback';
  static const String drive = '/drive';
  static const String player = '/watch/:videoId';
  static const String search = '/search';
}

/// ============================================================================
/// GoRouter プロバイダー
/// ============================================================================

final goRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);
  final isAuth = auth.isAuthenticated;

  return GoRouter(
    // 初期ルート設定
    initialLocation: isAuth ? Routes.home : Routes.login,
    redirect: (context, state) {
      final isLoginPage = state.uri.toString().startsWith(Routes.login);
      final isCallbackPage =
          state.uri.toString().startsWith(Routes.authCallback);
      final isDeepLink = state.uri.scheme == 'danmaku';
      final uri = state.uri.toString();

      _logger.i('[Router] redirect check - uri: $uri');
      _logger.i('[Router] scheme: ${state.uri.scheme}, isDeepLink: $isDeepLink');
      //_logger.i('[Router] isLoginPage: $isLoginPage, isCallbackPage: $isCallbackPage, isAuth: $isAuth');

      // Deep Link (danmaku://...) の場合、アプリ内パスに変換してリダイレクト
      if (isDeepLink) {
        _logger.i('[Router] 🔗 Deep Link detected: $uri');
        
        // danmaku://auth/callback?... → /auth/callback?...
        if (uri.contains('auth/callback')) {
          final queryString = uri.contains('?') 
              ? uri.substring(uri.indexOf('?')) 
              : '';
          final appPath = '/auth/callback$queryString';
          _logger.i('[Router] Converting deep link to app path: $appPath');
          return appPath;
        }
      }

      // コールバックページは常に許可
      if (isCallbackPage) {
        //_logger.i('[Router] Callback page, allowing to proceed');
        return null;
      }

      // 認証されていない、ログイン/コールバックページ以外はログイン画面へ
      if (!isAuth && !isLoginPage) {
        _logger.i('[Router] Redirecting to login (not authenticated)');
        return Routes.login;
      }

      // 認証済みでログイン画面はホームへ
      if (isAuth && isLoginPage) {
        _logger.i('[Router] Redirecting to home (already authenticated)');
        return Routes.home;
      }

      return null;
    },
    routes: [
      // ログイン
      GoRoute(
        path: Routes.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),

      // ディープリンク用ルート（danmaku://auth/callback?user=...&token=...）
      GoRoute(
        path: '/auth/callback',
        name: 'deepLinkCallback',
        builder: (context, state) {
          _logger.i('[Router] ==================== Deep link受信 ====================');
          _logger.i('[Router] ${state.uri}');
          final user = state.uri.queryParameters['user'];
          final token = state.uri.queryParameters['token'];

          //_logger.i('[Router] user=${user != null ? "provided" : "missing"}, token=${token != null ? "provided" : "missing"}');

          if (user == null || token == null) {
            _logger.e('[Router] ⛔ user または token が指定されていません');
            return const Scaffold(
              body: Center(child: Text('認証パラメータが無効です')),
            );
          }

          _logger.i('[Router] 🔐 AuthCallbackPage を作成');
          return AuthCallbackPage(user: user, token: token);
        },
      ),

      // ホーム
      GoRoute(
        path: Routes.home,
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),

      // Google Drive
      GoRoute(
        path: Routes.drive,
        name: 'drive',
        builder: (context, state) => const DrivePage(),
      ),

      // 動画プレイヤー
      GoRoute(
        path: Routes.player,
        name: 'player',
        builder: (context, state) {
          final videoId = state.pathParameters['videoId'];
          final fileName = state.uri.queryParameters['fileName'];
          final folderId = state.uri.queryParameters['folderId'] ?? '';
          
          //_logger.i('[Router] ========== PLAYER ROUTE ==========');
          //_logger.i('[Router] URI: ${state.uri}');
          //_logger.i('[Router] videoId from pathParameters: $videoId');
          //_logger.i('[Router] fileName from queryParameters: $fileName');
          //_logger.i('[Router] folderId from queryParameters: $folderId');
          //_logger.i('[Router] ========== END PLAYER ROUTE ==========');
          
          return PlayerPage(
            videoId: videoId ?? '',
            folderId: folderId,
            fileName: fileName,
          );
        },
      ),

      // 検索
      GoRoute(
        path: Routes.search,
        name: 'search',
        builder: (context, state) {
          final query = state.uri.queryParameters['q'];
          return HomePage(searchQuery: query);
        },
      ),
    ],
    errorBuilder: (context, state) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('ページが見つかりません',
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => context.go(Routes.home),
                child: const Text('ホームへ'),
              ),
            ],
          ),
        ),
      );
    },
  );
});

/// ============================================================================
/// ナビゲーション拡張
/// ============================================================================

extension GoRouterX on BuildContext {
  void goHome() => go(Routes.home);
  void goLogin() => go(Routes.login);
  void goDrive() => go(Routes.drive);
  void goPlayer(String videoId, {String? fileName, String? folderId}) {
    final queryParams = <String>[];
    if (fileName != null) queryParams.add('fileName=$fileName');
    if (folderId != null) queryParams.add('folderId=$folderId');
    final query = queryParams.isNotEmpty ? '?${queryParams.join('&')}' : '';
    go('${Routes.player.replaceFirst(':videoId', videoId)}$query');
  }

  void goSearch(String query) => go('${Routes.search}?q=$query');
}
