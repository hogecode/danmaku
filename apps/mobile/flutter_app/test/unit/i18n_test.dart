import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_app/core/utils/i18n.dart';

void main() {
  group('AppLocalizations', () {
    test('日本語ロケール初期化', () {
      final localizations = AppLocalizations(const Locale('ja'));
      expect(localizations.languageCode, 'ja');
    });

    test('英語ロケール初期化', () {
      final localizations = AppLocalizations(const Locale('en'));
      expect(localizations.languageCode, 'en');
    });

    group('日本語翻訳', () {
      late AppLocalizations localizations;

      setUp(() {
        localizations = AppLocalizations(const Locale('ja'));
      });

      test('play', () {
        expect(localizations.play, '再生');
      });

      test('pause', () {
        expect(localizations.pause, '一時停止');
      });

      test('danmakuSettings', () {
        expect(localizations.danmakuSettings, 'ダンマク設定');
      });

      test('opacity', () {
        expect(localizations.opacity, '不透明度');
      });

      test('speed', () {
        expect(localizations.speed, '速度');
      });

      test('darkMode', () {
        expect(localizations.darkMode, 'ダークモード');
      });

      test('settings', () {
        expect(localizations.settings, '設定');
      });
    });

    group('英語翻訳', () {
      late AppLocalizations localizations;

      setUp(() {
        localizations = AppLocalizations(const Locale('en'));
      });

      test('play', () {
        expect(localizations.play, 'Play');
      });

      test('pause', () {
        expect(localizations.pause, 'Pause');
      });

      test('danmakuSettings', () {
        expect(localizations.danmakuSettings, 'Danmaku Settings');
      });

      test('opacity', () {
        expect(localizations.opacity, 'Opacity');
      });

      test('speed', () {
        expect(localizations.speed, 'Speed');
      });

      test('darkMode', () {
        expect(localizations.darkMode, 'Dark Mode');
      });

      test('settings', () {
        expect(localizations.settings, 'Settings');
      });
    });

    group('時間フォーマット', () {
      late AppLocalizations localizations;

      setUp(() {
        localizations = AppLocalizations(const Locale('ja'));
      });

      test('30秒をフォーマット', () {
        final formatted = localizations.formatTime(const Duration(seconds: 30));
        expect(formatted, '00:30');
      });

      test('1分30秒をフォーマット', () {
        final formatted = localizations.formatTime(const Duration(minutes: 1, seconds: 30));
        expect(formatted, '01:30');
      });

      test('59分59秒をフォーマット', () {
        final formatted = localizations.formatTime(const Duration(minutes: 59, seconds: 59));
        expect(formatted, '59:59');
      });
    });

    group('Delegate', () {
      test('対応言語確認 - 日本語', () {
        const delegate = AppLocalizationsDelegate();
        expect(delegate.isSupported(const Locale('ja')), true);
      });

      test('対応言語確認 - 英語', () {
        const delegate = AppLocalizationsDelegate();
        expect(delegate.isSupported(const Locale('en')), true);
      });

      test('非対応言語', () {
        const delegate = AppLocalizationsDelegate();
        expect(delegate.isSupported(const Locale('fr')), false);
      });
    });
  });
}
