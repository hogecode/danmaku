import 'package:flutter_riverpod/flutter_riverpod.dart';

// ============================================================================
// Page Routes (Next.js 風)
// ============================================================================

/// ページ種別の列挙
enum PageRoute {
  home,        // /
  drive,       // /drive
  player,      // /watch/[videoId]
  search,      // /search
}

/// プレイヤーページのパラメータ
class PlayerPageParams {
  final String videoId;
  final String? fileName;

  PlayerPageParams({
    required this.videoId,
    this.fileName,
  });
}

// ============================================================================
// Navigation Providers
// ============================================================================

/// 現在のページプロバイダー（ルーティング）
final currentPageProvider =
    StateProvider<PageRoute>((ref) => PageRoute.home);

/// プレイヤーページのパラメータプロバイダー
final playerPageParamsProvider =
    StateProvider<PlayerPageParams?>((ref) => null);

/// 現在のフォルダ ID プロバイダー
final currentFolderIdProvider =
    StateProvider<String>((ref) => 'root');

/// 現在のフォルダ名プロバイダー
final currentFolderNameProvider =
    StateProvider<String>((ref) => 'My Drive');

/// フォルダ階層履歴プロバイダー（id と name のペア）
final folderHistoryProvider = StateProvider<
    List<({String id, String name})>>((ref) => []);

/// 検索クエリプロバイダー
final searchQueryProvider =
    StateProvider<String>((ref) => '');

/// 検索結果表示中フラグ
final isSearchingProvider =
    StateProvider<bool>((ref) => false);

// ============================================================================
// Navigation Actions (Router 風)
// ============================================================================

/// ページ遷移ロジック
final routerProvider =
    Provider<AppRouter>((ref) {
  return AppRouter(ref);
});

/// アプリケーション Router
class AppRouter {
  final Ref ref;

  AppRouter(this.ref);

  /// ホームページへ遷移
  void goHome() {
    ref.read(currentPageProvider
        .notifier)
        .state = PageRoute.home;
  }

  /// Google Drive ページへ遷移
  void goDrive() {
    ref.read(currentPageProvider
        .notifier)
        .state = PageRoute.drive;
    ref.read(currentFolderIdProvider
        .notifier)
        .state = 'root';
    ref.read(currentFolderNameProvider
        .notifier)
        .state = 'My Drive';
  }

  /// 動画プレイヤーページへ遷移
  void goPlayer({
    required String videoId,
    String? fileName,
  }) {
    ref.read(currentPageProvider
        .notifier)
        .state = PageRoute.player;
    ref.read(playerPageParamsProvider
        .notifier)
        .state = PlayerPageParams(
      videoId: videoId,
      fileName: fileName,
    );
  }

  /// 検索ページへ遷移
  void goSearch(String query) {
    ref.read(currentPageProvider
        .notifier)
        .state = PageRoute.search;
    ref.read(searchQueryProvider
        .notifier)
        .state = query;
  }

  /// 前のフォルダへ戻る
  void goBack() {
    final history = ref
        .read(folderHistoryProvider)
        .toList();
    if (history.isNotEmpty) {
      history.removeLast();
      final lastFolder =
          history.isNotEmpty
              ? history.last
              : (
                  id: 'root',
                  name: 'My Drive'
                );
      ref.read(currentFolderIdProvider
          .notifier)
          .state = lastFolder.id;
      ref.read(
              currentFolderNameProvider
                  .notifier)
          .state = lastFolder.name;
      ref.read(folderHistoryProvider
          .notifier)
          .state = history;
    }
  }

  /// フォルダへ移動
  void navigateToFolder({
    required String folderId,
    required String folderName,
  }) {
    final history = ref
        .read(folderHistoryProvider)
        .toList();
    history.add((id: folderId, name: folderName));
    ref.read(currentFolderIdProvider
        .notifier)
        .state = folderId;
    ref.read(currentFolderNameProvider
        .notifier)
        .state = folderName;
    ref.read(folderHistoryProvider
        .notifier)
        .state = history;
  }
}
