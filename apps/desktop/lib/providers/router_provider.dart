import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:desktop/core/logger/app_logger.dart';
import 'package:desktop/pages/auth/login_page.dart';
import 'package:desktop/pages/auth/auth_callback_page.dart';
import 'package:desktop/pages/home_page_go.dart';
import 'package:desktop/pages/drive_page.dart';
import 'package:desktop/pages/player_page.dart';
import 'package:desktop/providers/auth_provider.dart';

/// ============================================================================
/// GoRouter 刷新通知クラス
/// ============================================================================

/// GoRouter の状態変更を監視するための ChangeNotifier
class GoRouterRefreshNotifier extends ChangeNotifier {
  final Ref _ref;
  late AuthState _latestAuthState;

  GoRouterRefreshNotifier(this._ref) {
    // 初期状態を取得
    _latestAuthState = _ref.read(authProvider);
    
    // authProvider の変更を監視
    _ref.listen(authProvider, (previous, next) {
      _latestAuthState = next;
      notifyListeners();
    });
  }

  /// 最新の認証状態を取得
  AuthState getLatestAuthState() => _latestAuthState;
}

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

  // 🔄 GoRouter を刷新するための Notifier
  final refreshNotifier = GoRouterRefreshNotifier(ref);

  return GoRouter(
    // 初期ルート設定
    initialLocation: isAuth ? Routes.home : Routes.login,
    refreshListenable: refreshNotifier,
    redirect: (context, state) {
      // redirect 内で authProvider を監視するため、refreshNotifier 経由で状態取得
      final currentAuth = refreshNotifier.getLatestAuthState();
      final isAuth = currentAuth.isAuthenticated;
      
      final isLoginPage = state.uri.toString().startsWith(Routes.login);
      final isCallbackPage =
          state.uri.toString().startsWith(Routes.authCallback);
      final isDeepLink = state.uri.scheme == 'danmaku';
      final uri = state.uri.toString();

      appLogger.debug('[Router] redirect check - uri: $uri');
      appLogger.debug('[Router] scheme: ${state.uri.scheme}, isDeepLink: $isDeepLink');

      // Deep Link (danmaku://...) の場合、アプリ内パスに変換してリダイレクト
      if (isDeepLink) {
        appLogger.info('[Router] 🔗 Deep Link detected: $uri');
        
        // danmaku://auth/callback?... → /auth/callback?...
        if (uri.contains('auth/callback')) {
          final queryString = uri.contains('?') 
              ? uri.substring(uri.indexOf('?')) 
              : '';
          final appPath = '/auth/callback$queryString';
          appLogger.info('[Router] Converting deep link to app path: $appPath');
          return appPath;
        }
      }

      // コールバックページは常に許可
      if (isCallbackPage) {
        return null;
      }

      // 認証されていない、ログイン/コールバックページ以外はログイン画面へ
      if (!isAuth && !isLoginPage) {
        appLogger.info('[Router] Redirecting to login (not authenticated)');
        return Routes.login;
      }

      // 認証済みでログイン画面はホームへ
      if (isAuth && isLoginPage) {
        appLogger.info('[Router] Redirecting to home (already authenticated)');
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
          appLogger.info('[Router] ==================== Deep link受信 ====================');
          appLogger.info('[Router] ${state.uri}');
          final user = state.uri.queryParameters['user'];
          final token = state.uri.queryParameters['token'];

          appLogger.debug('[Router] user=${user != null ? "provided" : "missing"}, token=${token != null ? "provided" : "missing"}');

          if (user == null || token == null) {
            appLogger.error('[Router] ⛔ user または token が指定されていません');
            return const Scaffold(
              body: Center(child: Text('認証パラメータが無効です')),
            );
          }

          appLogger.info('[Router] 🔐 AuthCallbackPage を作成');
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
    errorBuilder: (context, state) => Scaffold(
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
    ),
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
