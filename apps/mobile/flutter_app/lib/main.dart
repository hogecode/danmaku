import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_app/core/themes/app_theme.dart';
import 'package:flutter_app/core/i18n/i18n.dart';
import 'package:flutter_app/data/services/storage_service.dart';
import 'package:flutter_app/presentation/pages/player_page.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/presentation/providers/app_provider.dart';

// グローバル変数で初期化済みのStorageServiceを保持
late StorageService _initializedStorageService;

void main() async {
  // Hive を初期化
  await Hive.initFlutter();
  
  // ストレージサービスを初期化
  _initializedStorageService = StorageService();
  await _initializedStorageService.initialize();

  runApp(
    ProviderScope(
      overrides: [
        storageServiceProvider.overrideWithValue(_initializedStorageService),
      ],
      child: const MyApp(),
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
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        const AppLocalizationsDelegate(),
      ],
      supportedLocales: const [
        Locale('ja'),
        Locale('en'),
      ],
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
      body: SingleChildScrollView(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              Text(
                'テストビデオを再生',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      // TODO: 後でページを追加する
                      builder: (context) => const PlayerPage(
                        videoId: 'test_video_1',
                        // TODO: ビデオURLを動的に設定する
                        videoUrl:
                            'http://100.72.160.115:8000/api/v1/files/6/mono02.mp4',
                        videoTitle: 'Big Buck Bunny',
                      ),
                    ),
                  );
                },
                child: const Text('プレイヤーを開く'),
              ),
              const SizedBox(height: 40),
              // ダークモード切り替え
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 16,
                children: [
                  Text(isDarkMode ? '🌙 ダークモード' : '☀️ ライトモード'),
                  Switch(
                    value: isDarkMode,
                    onChanged: (value) {
                      ref.read(darkModeProvider.notifier).state = value;
                    },
                  ),
                ],
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
