import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/presentation/providers/auth_provider.dart';
import 'package:mobile/presentation/providers/ui_provider.dart';
import 'package:mobile/presentation/providers/navigation_provider.dart';
import 'package:mobile/presentation/pages/widgets/menu_button.dart';

/// ホーム画面
class HomePage
    extends ConsumerWidget {
  const HomePage({Key? key})
      : super(key: key);

  @override
  Widget build(BuildContext context,
      WidgetRef ref) {
    final user = ref
        .watch(currentUserProvider);
    final isDarkMode =
        ref.watch(darkModeProvider);

    return Scaffold(
      backgroundColor: isDarkMode
          ? const Color(0xFF1A1A1A)
          : const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Danmaku'),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(isDarkMode
                ? Icons.light_mode
                : Icons.dark_mode),
            onPressed: () {
              ref
                  .read(
                      darkModeProvider
                          .notifier)
                  .state =
                  !isDarkMode;
            },
          ),
        ],
      ),
      body:
          SingleChildScrollView(
        child: Padding(
          padding:
              const EdgeInsets.all(
                  16.0),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment
                    .start,
            children: [
              if (user != null) ...[
                _buildUserCard(
                    context, user,
                    isDarkMode),
                const SizedBox(
                    height: 32),
              ],
              _buildWelcomeSection(
                  context, user,
                  isDarkMode),
              const SizedBox(height: 24),
              _buildMenuSection(
                  context, ref,
                  isDarkMode),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserCard(
    BuildContext context,
    dynamic user,
    bool isDarkMode,
  ) {
    return Container(
      padding:
          const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode
            ? const Color(0xFF2D2D2D)
            : Colors.white,
        borderRadius:
            BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.blue
                  .withOpacity(0.2),
              borderRadius:
                  BorderRadius.circular(
                      30),
            ),
            child: const Icon(
                Icons.person,
                color: Colors.blue,
                size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,
              children: [
                Text(
                  user.name ??
                      'ユーザー',
                  style: Theme.of(
                          context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(
                    fontWeight:
                        FontWeight.bold,
                  ),
                ),
                const SizedBox(
                    height: 4),
                Text(
                  user.email,
                  style: Theme.of(
                          context)
                      .textTheme
                      .bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection(
    BuildContext context,
    dynamic user,
    bool isDarkMode,
  ) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Text(
          'ようこそ${user?.name ?? 'ユーザー'}さん！',
          style: Theme.of(context)
              .textTheme
              .headlineSmall
              ?.copyWith(
            fontWeight:
                FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Danmaku はリアルタイムコメント配信プラットフォームです',
          style: Theme.of(context)
              .textTheme
              .bodyMedium,
        ),
      ],
    );
  }

  Widget _buildMenuSection(
    BuildContext context,
    WidgetRef ref,
    bool isDarkMode,
  ) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Text(
          'メニュー',
          style: Theme.of(context)
              .textTheme
              .titleLarge
              ?.copyWith(
            fontWeight:
                FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        MenuButton(
          icon: Icons.cloud,
          title: 'Google Drive',
          subtitle: 'ビデオを再生',
          isDarkMode: isDarkMode,
          onPressed: () {
            ref
                .read(routerProvider)
                .goDrive();
          },
        ),
        const SizedBox(height: 12),
        MenuButton(
          icon: Icons.download,
          title:
              'ニコ動ダウンロード',
          subtitle:
              '動画とコメントをダウンロード',
          isDarkMode: isDarkMode,
          onPressed: () {
            ScaffoldMessenger.of(
                    context)
                .showSnackBar(
              const SnackBar(
                  content: Text(
                      'まだ実装されていません')),
            );
          },
        ),
      ],
    );
  }
}
