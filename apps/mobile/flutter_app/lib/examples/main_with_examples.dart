import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_app/core/themes/app_theme.dart';
import 'package:flutter_app/core/utils/i18n.dart';
import 'package:flutter_app/data/services/storage_service.dart';
import 'package:flutter_app/presentation/pages/player_page.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/examples/danmaku_demo.dart';
import 'package:flutter_app/examples/settings_demo.dart';

void main() async {
  await Hive.initFlutter();
  final storage = StorageService();
  await storage.initialize();

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(darkModeProvider);

    return MaterialApp(
      title: 'Flutter DPlayer - デモアプリ',
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      localizationsDelegates: const [AppLocalizationsDelegate()],
      supportedLocales: supportedLocales,
      home: const ExampleHomeScreen(),
    );
  }
}

class ExampleHomeScreen extends StatelessWidget {
  const ExampleHomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter DPlayer - デモ'),
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'デモアプリケーション',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 32),

              // フルプレイヤーデモ
              _buildDemoButton(
                context,
                title: '🎬 フルプレイヤー',
                description: 'ビデオ再生 + ダンマク表示',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const PlayerPage(
                      videoId: 'sample_1',
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
                      videoTitle: 'Big Buck Bunny',
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ダンマク表示デモ
              _buildDemoButton(
                context,
                title: '📨 ダンマク表示デモ',
                description: '不透明度・速度制御',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const DanmakuDemoPage()),
                ),
              ),
              const SizedBox(height: 16),

              // 設定デモ
              _buildDemoButton(
                context,
                title: '⚙️ 設定デモ',
                description: 'テーマ・ダンマク設定',
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SettingsDemoPage()),
                ),
              ),
              const SizedBox(height: 32),

              // 情報
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'デモアプリについて',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text('このデモアプリでは以下の機能を試すことができます：'),
                    Text('• ビデオ再生・再生速度制御'),
                    Text('• ダンマク表示・制御'),
                    Text('• 不透明度・速度調整'),
                    Text('• テーマ切り替え（ライト・ダーク）'),
                    Text('• 多言語対応（日本語・英語）'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDemoButton(
    BuildContext context, {
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text(description),
        ),
        trailing: const Icon(Icons.arrow_forward),
        onTap: onTap,
      ),
    );
  }
}
