# Flutter DPlayer - API 仕様書

---

## 🌐 API エンドポイント

### 1. ダンマク取得（GET）

**エンドポイント**: `GET /api/danmaku`

**説明**: 指定されたビデオのダンマク（コメント）一覧を取得

**リクエストパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|----|----|------|
| `video_id` | String | ✅ | ビデオID |
| `limit` | Integer | - | 最大取得数（デフォルト: 1000） |
| `offset` | Integer | - | オフセット（ページネーション用） |

**リクエスト例**

```
GET /api/danmaku?video_id=video123&limit=1000
Host: api.danmaku.local
```

**レスポンス（成功: 200 OK）**

```json
{
  "code": 0,
  "msg": "Success",
  "data": [
    [0, "right", "#ffeaea", "User1", "コメント1", "medium"],
    [1.5, "top", "#ff0000", "User2", "上部テキスト", "big"],
    [3.2, "bottom", "#00ff00", "User3", "下部テキスト", "small"],
    [5.0, "right", "#ffff00", "User4", "テスト", "medium"]
  ]
}
```

**レスポンスの内容**

```
data: [
  [
    0,               // 時刻（秒）
    "right",         // タイプ: right|top|bottom
    "#ffeaea",       // HEXカラー
    "User1",         // 投稿者
    "コメント",      // テキスト
    "medium"         // サイズ: big|medium|small
  ]
]
```

**エラーレスポンス（400 Bad Request）**

```json
{
  "code": 400,
  "msg": "video_id is required",
  "data": null
}
```

**エラーレスポンス（500 Internal Server Error）**

```json
{
  "code": 500,
  "msg": "Internal server error",
  "data": null
}
```

---

## 🔑 Status Codes

| Code | 説明 |
|------|------|
| 0 | 成功 |
| 400 | リクエストエラー（パラメータ不正） |
| 401 | 認証失敗 |
| 404 | ビデオが見つからない |
| 500 | サーバーエラー |
| 503 | サービス利用不可 |

---

## 🔌 Dio クライアント実装例

```dart
// 1. インターフェース定義
@RestApi()
abstract class ApiClient {
  factory ApiClient(Dio dio) = _ApiClient;

  @GET('/api/danmaku')
  Future<ApiResponseModel<List<dynamic>>> getDanmaku({
    @Query('video_id') required String videoId,
    @Query('limit') int limit = 1000,
  });
}

// 2. ApiService ラッパー
class ApiService {
  late final ApiClient _client;

  ApiService() {
    final dio = Dio(BaseOptions(
      baseUrl: 'http://api.danmaku.local',
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
    ));
    _client = ApiClient(dio);
  }

  Future<List<DanmakuModel>> fetchDanmaku(String videoId) async {
    try {
      final response = await _client.getDanmaku(videoId: videoId);
      
      if (!response.isSuccess) {
        throw ApiException(response.msg ?? 'Unknown error');
      }

      // 配列形式を DanmakuModel に変換
      return (response.data as List)
        .map((item) => _parseRawDanmaku(item))
        .toList();
    } on DioException catch (e) {
      throw ApiException('Network error: ${e.message}');
    }
  }

  DanmakuModel _parseRawDanmaku(List<dynamic> raw) {
    return DanmakuModel(
      time: (raw[0] as num).toDouble(),
      type: raw[1] as String,
      color: raw[2] as String,
      author: raw[3] as String,
      text: raw[4] as String,
      size: raw.length > 5 ? raw[5] as String : 'medium',
    );
  }
}

// 3. 使用例
final danmakuList = await apiService.fetchDanmaku('video123');
```

---

## ⚡ タイムアウト・リトライ設定

```dart
final dio = Dio(BaseOptions(
  baseUrl: 'http://api.danmaku.local',
  connectTimeout: Duration(seconds: 10),
  receiveTimeout: Duration(seconds: 10),
  sendTimeout: Duration(seconds: 10),
));

// リトライロジック
dio.interceptors.add(
  InterceptorsWrapper(
    onError: (error, handler) async {
      if (error.type == DioExceptionType.connectionTimeout) {
        // リトライ処理
        return handler.resolve(await _retry(error.requestOptions));
      }
      return handler.next(error);
    },
  ),
);
```

---

## 🔐 認証（後実装予定）

**ヘッダー例**

```
Authorization: Bearer {access_token}
```

---

## 📊 後実装予定の API

### 2. ダンマク送信（POST）

```
POST /api/danmaku
Content-Type: application/json

{
  "video_id": "video123",
  "time": 5.0,
  "type": "right",
  "color": "#ffeaea",
  "text": "コメント内容",
  "size": "medium"
}
```

### 3. ビデオ一覧取得（GET）

```
GET /api/videos?limit=20&offset=0
```

---

**次のドキュメント**: [04_UI_SPECIFICATIONS.md](./04_UI_SPECIFICATIONS.md)
