import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/pages/auth/login_page.dart';
import 'package:mobile/pages/auth/auth_callback_page.dart';
import 'package:mobile/pages/home_page_go.dart';
import 'package:mobile/pages/drive_page.dart';
import 'package:mobile/pages/player_page.dart';
import 'package:mobile/providers/auth_provider.dart';

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
    initialLocation: isAuth ? Routes.home : Routes.login,
    redirect: (context, state) {
      final isLoginPage = state.uri.toString().startsWith(Routes.login);
      final isCallbackPage =
          state.uri.toString().startsWith(Routes.authCallback);

      // 認証されていない、ログイン/コールバックページ以外はログイン画面へ
      if (!isAuth && !isLoginPage && !isCallbackPage) {
        return Routes.login;
      }

      // 認証済みでログイン画面はホームへ
      if (isAuth && isLoginPage) {
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

      // OAuth コールバック（Deep Link）
      GoRoute(
        path: Routes.authCallback,
        name: 'authCallback',
        builder: (context, state) {
          final code = state.uri.queryParameters['code'];
          final stateParam = state.uri.queryParameters['state'];

          if (code == null || stateParam == null) {
            return const Scaffold(
              body: Center(child: Text('Invalid callback parameters')),
            );
          }

          return AuthCallbackPage(code: code, state: stateParam);
        },
      ),

      // ディープリンク用ルート（danmaku://auth/callback）
      GoRoute(
        path: '/auth/callback',
        name: 'deepLinkCallback',
        builder: (context, state) {
          final code = state.uri.queryParameters['code'];
          final stateParam = state.uri.queryParameters['state'];
          final user = state.uri.queryParameters['user'];

          if (code == null || stateParam == null) {
            return const Scaffold(
              body: Center(child: Text('Invalid deep link parameters')),
            );
          }

          return AuthCallbackPage(code: code, state: stateParam, user: user);
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
          return PlayerPage(videoId: videoId ?? '', fileName: fileName);
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
  void goPlayer(String videoId, {String? fileName}) {
    final query = fileName != null ? '?fileName=$fileName' : '';
    go('${Routes.player.replaceFirst(':videoId', videoId)}$query');
  }

  void goSearch(String query) => go('${Routes.search}?q=$query');
}
