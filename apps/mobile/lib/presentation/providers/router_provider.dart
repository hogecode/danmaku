import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/presentation/pages/auth/login_page.dart';
import 'package:mobile/presentation/pages/home_page_go.dart';
import 'package:mobile/presentation/pages/drive_page.dart';
import 'package:mobile/presentation/pages/player_page.dart';
import 'package:mobile/presentation/providers/auth_provider.dart';

// ============================================================================
// Route Names (Next.js 風)
// ============================================================================

/// ルート名定数
class Routes {
  static const String home = '/';
  static const String login = '/login';
  static const String drive = '/drive';
  static const String player = '/watch/:videoId';
  static const String search = '/search';
}

// ============================================================================
// GoRouter Provider
// ============================================================================

/// GoRouter プロバイダー
final goRouterProvider =
    Provider<GoRouter>((ref) {
  final isAuth = ref
      .watch(isAuthenticatedProvider);

  return GoRouter(
    initialLocation: isAuth
        ? Routes.home
        : Routes.login,
    redirect: (context, state) {
      // 認証状態に基づくリダイレクト
      final isLoginPage = state.uri
          .toString()
          .startsWith(Routes.login);

      if (!isAuth &&
          !isLoginPage) {
        return Routes.login;
      }

      if (isAuth &&
          isLoginPage) {
        return Routes.home;
      }

      return null;
    },
    routes: [
      // ログインページ
      GoRoute(
        path: Routes.login,
        name: 'login',
        builder: (context, state) =>
            const LoginPage(),
      ),

      // ホームページ
      GoRoute(
        path: Routes.home,
        name: 'home',
        builder: (context, state) =>
            const HomePage(),
      ),

      // Google Drive ページ
      GoRoute(
        path: Routes.drive,
        name: 'drive',
        builder: (context, state) =>
            const DrivePage(),
      ),

      // 動画プレイヤーページ
      GoRoute(
        path: Routes.player,
        name: 'player',
        builder: (context, state) {
          final videoId = state
              .pathParameters['videoId'];
          final fileName =
              state.uri.queryParameters[
                  'fileName'];

          return PlayerPage(
            videoId: videoId ?? '',
            fileName: fileName,
          );
        },
      ),

      // 検索ページ
      GoRoute(
        path: Routes.search,
        name: 'search',
        builder: (context, state) {
          final query = state.uri
              .queryParameters['q'];
          return HomePage(searchQuery: query);
        },
      ),
    ],
    errorBuilder:
        (context, state) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment:
                MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 48,
                color: Colors.red,
              ),
              const SizedBox(height: 16),
              Text(
                'ページが見つかりません',
                style: Theme.of(context)
                    .textTheme
                    .headlineSmall,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () =>
                    context.go(
                        Routes.home),
                child:
                    const Text('ホームへ'),
              ),
            ],
          ),
        ),
      );
    },
  );
});

// ============================================================================
// Navigation Extensions
// ============================================================================

/// BuildContext 拡張でナビゲーション簡潔化
extension GoRouterExtension
    on BuildContext {
  /// ホームへ遷移
  void goHome() =>
      go(Routes.home);

  /// ログインページへ遷移
  void goLogin() =>
      go(Routes.login);

  /// Google Drive へ遷移
  void goDrive() =>
      go(Routes.drive);

  /// 動画プレイヤーへ遷移
  void goPlayer({
    required String videoId,
    String? fileName,
  }) {
    final query = fileName != null
        ? '?fileName=$fileName'
        : '';
    go('${Routes.drive}/$videoId$query');
  }

  /// 検索ページへ遷移
  void goSearch(String query) {
    go('${Routes.search}?q=$query');
  }

  /// 戻る
  void goBack() => pop();
}

/// WidgetRef 拡張でナビゲーション簡潔化
extension GoRouterRefExtension
    on WidgetRef {
  /// GoRouter インスタンス取得
  GoRouter get router =>
      read(goRouterProvider);
}
