import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/logger/app_logger.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/router_provider.dart';
import 'package:mobile/providers/app_ui_provider.dart';
  
class HomePage extends ConsumerStatefulWidget {
  final String? searchQuery;

  const HomePage({
    Key? key,
    this.searchQuery,
  }) : super(key: key);

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}


class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    appLogger.info('ホーム画面を初期化');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = ref.watch(darkModeProvider);
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Danmaku'),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () async {
              await ref.read(darkModeProvider.notifier).toggle();
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.home, size: 80, color: Colors.blue),
              const SizedBox(height: 24),
              Text(
                'ホーム',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 16),
              Text(
                'ユーザー: ${auth.user?['name'] ?? "Unknown"}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 48),
              // Google Driveボタン
              ElevatedButton.icon(
                onPressed: () => context.go(Routes.drive),
                icon: const Icon(Icons.cloud),
                label: const Text('Google Drive'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 16,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // 検索バー
              TextField(
                decoration: InputDecoration(
                  hintText: '検索キーワード...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      // 検索クリア
                    },
                  ),
                ),
                onSubmitted: (query) {
                  if (query.isNotEmpty) {
                    context.go(Routes.search + '?q=$query');
                  }
                },
              ),
              const SizedBox(height: 48),
              // 検索結果エリア（プレースホルダー）
              if (widget.searchQuery != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Colors.grey.withOpacity(0.3),
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '検索: ${widget.searchQuery}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  /// ログアウト処理
  Future<void> _logout() async {
    try {
      appLogger.info('ログアウト開始');
      await ref.read(authProvider.notifier).logout();

      if (mounted) {
        context.go(Routes.login);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('ログアウトしました'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      appLogger.error('ログアウト失敗', e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('ログアウト失敗: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
