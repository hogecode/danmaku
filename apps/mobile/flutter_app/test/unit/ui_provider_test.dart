import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';

void main() {
  group('UI Providers', () {
    test('danmakuOpacityProvider 初期値', () {
      final container = ProviderContainer();
      final opacity = container.read(danmakuOpacityProvider);
      expect(opacity, 1.0);
    });

    test('danmakuOpacityProvider 値更新', () {
      final container = ProviderContainer();
      container.read(danmakuOpacityProvider.notifier).state = 0.5;
      expect(container.read(danmakuOpacityProvider), 0.5);
    });

    test('danmakuOpacityProvider 範囲チェック', () {
      final container = ProviderContainer();
      
      // 最小値
      container.read(danmakuOpacityProvider.notifier).state = 0.0;
      expect(container.read(danmakuOpacityProvider), 0.0);
      
      // 最大値
      container.read(danmakuOpacityProvider.notifier).state = 1.0;
      expect(container.read(danmakuOpacityProvider), 1.0);
    });

    test('danmakuSpeedRateProvider 初期値', () {
      final container = ProviderContainer();
      final speedRate = container.read(danmakuSpeedRateProvider);
      expect(speedRate, 1.0);
    });

    test('danmakuSpeedRateProvider 値更新', () {
      final container = ProviderContainer();
      container.read(danmakuSpeedRateProvider.notifier).state = 1.5;
      expect(container.read(danmakuSpeedRateProvider), 1.5);
    });

    test('danmakuSpeedRateProvider 範囲チェック', () {
      final container = ProviderContainer();
      
      // 最小値
      container.read(danmakuSpeedRateProvider.notifier).state = 0.5;
      expect(container.read(danmakuSpeedRateProvider), 0.5);
      
      // 最大値
      container.read(danmakuSpeedRateProvider.notifier).state = 3.0;
      expect(container.read(danmakuSpeedRateProvider), 3.0);
    });

    test('danmakuVisibilityProvider 初期値', () {
      final container = ProviderContainer();
      final visibility = container.read(danmakuVisibilityProvider);
      expect(visibility, true);
    });

    test('danmakuVisibilityProvider トグル', () {
      final container = ProviderContainer();
      
      // 初期値は表示
      expect(container.read(danmakuVisibilityProvider), true);
      
      // 非表示に変更
      container.read(danmakuVisibilityProvider.notifier).state = false;
      expect(container.read(danmakuVisibilityProvider), false);
      
      // 表示に変更
      container.read(danmakuVisibilityProvider.notifier).state = true;
      expect(container.read(danmakuVisibilityProvider), true);
    });

    test('darkModeProvider 初期値', () {
      final container = ProviderContainer();
      final darkMode = container.read(darkModeProvider);
      expect(darkMode, false);
    });

    test('darkModeProvider トグル', () {
      final container = ProviderContainer();
      
      // 初期値はライトモード
      expect(container.read(darkModeProvider), false);
      
      // ダークモードに変更
      container.read(darkModeProvider.notifier).state = true;
      expect(container.read(darkModeProvider), true);
      
      // ライトモードに変更
      container.read(darkModeProvider.notifier).state = false;
      expect(container.read(darkModeProvider), false);
    });

    test('controllerVisibleProvider 初期値', () {
      final container = ProviderContainer();
      final visible = container.read(controllerVisibleProvider);
      expect(visible, true);
    });

    test('複数プロバイダー同時管理', () {
      final container = ProviderContainer();
      
      // すべてのプロバイダーを変更
      container.read(danmakuOpacityProvider.notifier).state = 0.8;
      container.read(danmakuSpeedRateProvider.notifier).state = 1.5;
      container.read(danmakuVisibilityProvider.notifier).state = false;
      container.read(darkModeProvider.notifier).state = true;
      
      // 検証
      expect(container.read(danmakuOpacityProvider), 0.8);
      expect(container.read(danmakuSpeedRateProvider), 1.5);
      expect(container.read(danmakuVisibilityProvider), false);
      expect(container.read(darkModeProvider), true);
    });
  });
}
