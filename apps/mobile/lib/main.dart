import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/logger/app_logger.dart';
import 'package:mobile/core/themes/app_theme.dart';
import 'package:mobile/core/i18n/i18n.dart';
import 'package:mobile/data/services/storage_service.dart';
import 'package:mobile/providers/app_ui_provider.dart';
import 'package:mobile/providers/router_provider.dart';

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


class MyApp extends ConsumerStatefulWidget {
  const MyApp({Key? key})
      : super(key: key);

  @override
  ConsumerState<MyApp> createState() => _MyAppState();
}


class _MyAppState extends ConsumerState<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    //_logger.d('[Main] App lifecycle state changed: $state');
    if (state == AppLifecycleState.resumed) {
      //_logger.i('[Main] App resumed, GoRouter will handle any pending deep links');
    }
  }

  @override
  Widget build(BuildContext context) {
    // ダークモード
    final isDarkMode =
        ref.watch(darkModeProvider);
    // GoRouter
    final goRouter =
        ref.watch(goRouterProvider);

    return MaterialApp.router(
      title: 'Danmaku',
      theme: AppTheme.lightTheme(),
      darkTheme:
          AppTheme.darkTheme(),
      themeMode: isDarkMode
          ? ThemeMode.dark
          : ThemeMode.light,
      // ローカライズ
      localizationsDelegates: [
        GlobalMaterialLocalizations
            .delegate,
        GlobalWidgetsLocalizations
            .delegate,
        GlobalCupertinoLocalizations
            .delegate,
        const AppLocalizationsDelegate(),
      ],
      supportedLocales: const [
        Locale('ja'),
        Locale('en'),
      ],
      routerConfig: goRouter,
    );
  }
}


