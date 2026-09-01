/// アプリケーション定数
class AppConstants {
  AppConstants._(); // Private constructor

  // API Configuration
  // 開発環境ではモックサーバーまたはlocalhostを使用
  static const String apiBaseUrl = 'http://localhost:3001';
  static const Duration apiConnectTimeout = Duration(seconds: 10);
  static const Duration apiReceiveTimeout = Duration(seconds: 10);
  static const Duration apiSendTimeout = Duration(seconds: 10);
  
  // テストモード（APIサーバーなしでテストする）
  static const bool useMockData = true;

  // Danmaku Configuration
  static const int maxDanmakuCount = 1000;
  static const double danmakuDurationSeconds = 8.0;
  static const double danmakuDistancePx = 1280.0;
  static const double danmakuLineHeight = 50.0;
  static const double danmakuCollisionMargin = 5.0;
  static const double danmakuDisplayDurationSeconds = 6.0; // ダンマク表示時間（秒）

  // Video Player Configuration
  static const double minPlaybackSpeed = 0.25;
  static const double maxPlaybackSpeed = 2.0;
  static const double defaultVolume = 1.0;

  // Danmaku Speeds
  static const double minDanmakuSpeed = 0.5;
  static const double maxDanmakuSpeed = 3.0;
  static const double defaultDanmakuSpeed = 1.0;
  
  // UI Configuration
  static const int animationDurationMs = 300;
  static const int controllerHideDurationMs = 3000;

  // Localization
  static const String defaultLanguage = 'ja';
  static const List<String> supportedLanguages = ['ja', 'en'];
}
