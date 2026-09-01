/**
 * ニコ動 API Constants
 * 参考: https://nicovideo.jp
 */

export class NicovideConstants {
  // API URLs
  // ニコ動公式 API ログインエンドポイント (https://account.nicovideo.jp に統一)
  static readonly LOGIN_URL = 'https://account.nicovideo.jp/api/v1/login';
  static readonly VIDEO_WATCH_URL = 'https://www.nicovideo.jp/watch/{0}';
  static readonly THUMB_INFO_API = 'http://ext.nicovideo.jp/api/getthumbinfo/{0}';
  static readonly THREAD_REFRESH_API = 'https://nvapi.nicovideo.jp/v1/comment/keys/thread?videoId={0}';
  static readonly COMMENTS_THREAD_URL = '{0}/v1/threads';

  // HTTP Headers
  static readonly API_HEADERS = {
    'X-Frontend-Id': '6',
    'X-Frontend-Version': '0',
    'X-Niconico-Language': 'ja-jp',
  };

  // Cookie defaults
  static readonly HTML5_COOKIE = {
    watch_flash: '0',
  };

  // Defaults
  static readonly COMMENTS_LIMIT_DEFAULT_N = 1000;
  static readonly COMMENTS_THREAD_COOLDOWN_S = 60;
  static readonly COMMENTS_THREAD_INTERVAL_S = 1;
  static readonly RETRY_ATTEMPTS = 5;
  static readonly BACKOFF_FACTOR = 2;
  static readonly BLOCK_SIZE = 1024;

  // User Agent
  static readonly MODULE_NAME = 'danmaku-nicovideo-dl';
  static readonly VERSION = '1.0.0';

  // キャッシュ設定
  static readonly CACHE_TTL_SECONDS = 3600; // 1 時間
  static readonly CACHE_KEY_PREFIX = 'nicovideo:';

  // ファイル拡張子
  static readonly VALID_EXTENSIONS = ['mp4', 'm4a', 'm4v', 'ts', 'mkv'];
}
