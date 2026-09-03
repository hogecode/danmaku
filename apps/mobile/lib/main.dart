import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:mobile/core/themes/app_theme.dart';
import 'package:mobile/core/i18n/i18n.dart';
import 'package:mobile/data/services/storage_service.dart';
import 'package:mobile/presentation/pages/auth/login_page.dart';
import 'package:mobile/presentation/pages/home_page.dart';
import 'package:mobile/presentation/providers/ui_provider.dart';
import 'package:mobile/presentation/providers/auth_provider.dart';
import 'package:mobile/presentation/providers/app_provider.dart';

late StorageService _initializedStorageService;

void main() async {
  await Hive.initFlutter();

  _initializedStorageService = StorageService();
  await _initializedStorageService.initialize();

  runApp(
    ProviderScope(
      overrides: [
        storageServiceProvider
            .overrideWithValue(
                _initializedStorageService),
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
    final isAuth =
        ref.watch(isAuthenticatedProvider);

    return MaterialApp(
      title: 'Danmaku',
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: isDarkMode
          ? ThemeMode.dark
          : ThemeMode.light,
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
      home: isAuth
          ? const HomePage()
          : const LoginPage(),
    );
  }
}


