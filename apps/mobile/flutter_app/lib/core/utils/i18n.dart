import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// 多言語対応クラス
class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations(const Locale('ja'));
  }

  /// 言語コードを取得
  String get languageCode => locale.languageCode;

  // ============================================================================
  // Player UI
  // ============================================================================

  String get play => locale.languageCode == 'en' ? 'Play' : '再生';
  String get pause => locale.languageCode == 'en' ? 'Pause' : '一時停止';
  String get mute => locale.languageCode == 'en' ? 'Mute' : 'ミュート';
  String get unmute => locale.languageCode == 'en' ? 'Unmute' : 'ミュート解除';
  String get fullscreen =>
      locale.languageCode == 'en' ? 'Fullscreen' : '全画面';
  String get exitFullscreen =>
      locale.languageCode == 'en' ? 'Exit Fullscreen' : '全画面終了';
  String get settings => locale.languageCode == 'en' ? 'Settings' : '設定';

  // ============================================================================
  // Danmaku UI
  // ============================================================================

  String get danmakuSettings =>
      locale.languageCode == 'en' ? 'Danmaku Settings' : 'ダンマク設定';
  String get opacity => locale.languageCode == 'en' ? 'Opacity' : '不透明度';
  String get speed => locale.languageCode == 'en' ? 'Speed' : '速度';
  String get fontSize =>
      locale.languageCode == 'en' ? 'Font Size' : 'フォントサイズ';
  String get small => locale.languageCode == 'en' ? 'Small' : '小';
  String get medium => locale.languageCode == 'en' ? 'Medium' : '中';
  String get large => locale.languageCode == 'en' ? 'Large' : '大';
  String get show => locale.languageCode == 'en' ? 'Show' : '表示';
  String get hide => locale.languageCode == 'en' ? 'Hide' : '非表示';
  String get maxCount =>
      locale.languageCode == 'en' ? 'Max Count' : '最大数';
  String get danmakuVisibility =>
      locale.languageCode == 'en' ? 'Show Danmaku' : 'ダンマク表示';

  // ============================================================================
  // Playback Speed
  // ============================================================================

  String get playbackSpeed =>
      locale.languageCode == 'en' ? 'Playback Speed' : '再生速度';
  String get speed025 => '0.25x';
  String get speed050 => '0.5x';
  String get speed075 => '0.75x';
  String get speed100 => '1.0x';
  String get speed125 => '1.25x';
  String get speed150 => '1.5x';
  String get speed175 => '1.75x';
  String get speed200 => '2.0x';

  // ============================================================================
  // Quality
  // ============================================================================

  String get quality => locale.languageCode == 'en' ? 'Quality' : '画質';

  // ============================================================================
  // General
  // ============================================================================

  String get cancel => locale.languageCode == 'en' ? 'Cancel' : 'キャンセル';
  String get confirm => locale.languageCode == 'en' ? 'Confirm' : '確定';
  String get language => locale.languageCode == 'en' ? 'Language' : '言語';
  String get darkMode => locale.languageCode == 'en' ? 'Dark Mode' : 'ダークモード';
  String get english => 'English';
  String get japanese => '日本語';
  String get error => locale.languageCode == 'en' ? 'Error' : 'エラー';
  String get loading => locale.languageCode == 'en' ? 'Loading' : '読込中...';
  String get videoLoadFailed =>
      locale.languageCode == 'en'
          ? 'Failed to load video'
          : 'ビデオの再生に失敗しました';

  // ============================================================================
  // Time Formatting
  // ============================================================================

  String formatTime(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }
}

/// 多言語対応 Delegate
class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'ja'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) {
    return Future.value(AppLocalizations(locale));
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) {
    return false;
  }
}

/// サポート言語リスト
const List<Locale> supportedLocales = [
  Locale('ja'),
  Locale('en'),
];
