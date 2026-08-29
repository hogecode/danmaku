import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_app/core/themes/app_theme.dart';
import 'package:flutter_app/core/utils/i18n.dart';
import 'package:flutter_app/data/services/storage_service.dart';
import 'package:flutter_app/presentation/pages/player_page.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';

void main() async {
  // Hive を初期化
  await Hive.initFlutter();
  
  // ストレージサービスを初期化
  final storage = StorageService();
  await storage.initialize();

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(darkModeProvider);

    return MaterialApp(
      title: 'Flutter DPlayer',
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      localizationsDelegates: const [
        AppLocalizationsDelegate(),
      ],
      supportedLocales: supportedLocales,
      home: const HomePage(),
    );
  }
}

/// ホームページ
class HomePage extends ConsumerWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(darkModeProvider);
    final localizations = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter DPlayer'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'テストビデオを再生',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const PlayerPage(
                      videoId: 'test_video_1',
                      videoUrl:
                          'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
                      videoTitle: 'Big Buck Bunny',
                    ),
                  ),
                );
              },
              child: const Text('プレイヤーを開く'),
            ),
            const SizedBox(height: 40),
            // ダークモード切り替え
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(isDarkMode ? '🌙 ダークモード' : '☀️ ライトモード'),
                const SizedBox(width: 16),
                Switch(
                  value: isDarkMode,
                  onChanged: (value) {
                    ref.read(darkModeProvider.notifier).state = value;
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
