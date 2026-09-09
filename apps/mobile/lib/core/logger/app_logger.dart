import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

/// アプリケーション全体のログ設定
/// 開発環境では最小限の情報、本番環境ではシンプル形式
class AppLogger {
  static final AppLogger _instance = AppLogger._internal();

  late Logger _logger;

  AppLogger._internal() {
    _initializeLogger();
  }

  factory AppLogger() => _instance;

  /// ロギングの初期化
  void _initializeLogger() {
    // 開発環境 (kDebugMode) では最小限の情報
    // 本番環境 (!kDebugMode) ではログレベルを info 以上に制限

    if (kDebugMode) {
      // 開発環境: スタックトレース・ボーダーを非表示にした見やすい形式
      _logger = Logger(
        printer: _SimplePrettyPrinter(),
        level: Level.debug,
      );
    } else {
      // 本番環境: 最小限の情報のみ
      _logger = Logger(
        printer: SimplePrinter(
          printTime: false,
        ),
        level: Level.info,
      );
    }
  }

  /// ロギングインスタンス取得
  Logger get instance => _logger;

  /// info レベルでログ出力
  void info(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.i(message, error: error, stackTrace: stackTrace);
  }

  /// debug レベルでログ出力
  void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.d(message, error: error, stackTrace: stackTrace);
  }

  /// warning レベルでログ出力
  void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.w(message, error: error, stackTrace: stackTrace);
  }

  /// error レベルでログ出力
  void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  /// fatal レベルでログ出力
  void fatal(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.f(message, error: error, stackTrace: stackTrace);
  }
}

/// 開発環境専用: シンプルでスタックトレース・ボーダーを非表示にしたプリンター
class _SimplePrettyPrinter extends LogPrinter {
  @override
  List<String> log(LogEvent event) {
    // ログメッセージだけを出力（ボーダーなし、スタックトレースなし）
    final color = _getColorForLevel(event.level);
    final levelEmoji = _getLevelEmoji(event.level);

    return [
      '$levelEmoji ${event.message}',
    ];
  }

  /// ログレベルに対応した絵文字を取得
  String _getLevelEmoji(Level level) {
    switch (level) {
      case Level.debug:
        return '🔍';
      case Level.info:
        return '📌';
      case Level.warning:
        return '⚠️';
      case Level.error:
        return '❌';
      case Level.fatal:
        return '💥';
      default:
        return '📝';
    }
  }

  /// ログレベルに対応した色を取得（ANSI カラーコード）
  String _getColorForLevel(Level level) {
    switch (level) {
      case Level.debug:
        return '\u001B[36m'; // Cyan
      case Level.info:
        return '\u001B[32m'; // Green
      case Level.warning:
        return '\u001B[33m'; // Yellow
      case Level.error:
        return '\u001B[31m'; // Red
      case Level.fatal:
        return '\u001B[35m'; // Magenta
      default:
        return '\u001B[0m'; // Reset
    }
  }
}

/// グローバルロガーインスタンス
final appLogger = AppLogger();
