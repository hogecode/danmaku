# Kakolog Module

2ch実況ログ（Kakolog）のコメント取得APIの実装

## 概要

Jikkyo API（https://jikkyo.tsukumijima.net）から、チャンネル・時間範囲を指定してコメントを取得し、DPlayer互換形式で返すモジュール。

**対応チャンネル:** jk1, jk2, jk3, jk4, jk5, jk6, jk7, jk8, jk9, jk10（JP地上波）など

## API エンドポイント

### POST /api/kakolog/download/comments

チャンネルの指定時間範囲内のコメントを取得する

#### リクエスト

```json
{
  "channelId": "jk1",
  "startTime": 1700000000,
  "endTime": 1700003600,
  "limit": 1000
}
```

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `channelId` | string | Jikkyoチャンネルキー（例："jk1", "jk2"） | ✓ |
| `startTime` | number | 開始時刻（Unix timestamp） | ✓ |
| `endTime` | number | 終了時刻（Unix timestamp） | ✓ |
| `limit` | number | 取得件数上限（デフォルト: 無制限） | - |

#### レスポンス（成功時）

```json
{
  "status": "completed",
  "channelId": "jk1",
  "startTime": 1700000000,
  "endTime": 1700003600,
  "commentCount": 42,
  "retrievedCount": 42,
  "comments": [
    {
      "time": 10.5,
      "type": "normal",
      "size": "medium",
      "color": "184",
      "author": "user123",
      "text": "これはコメントです"
    },
    {
      "time": 20.0,
      "type": "top",
      "size": "big",
      "color": "red",
      "author": null,
      "text": "匿名コメント"
    }
  ]
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `status` | string | "completed" または "failed" |
| `channelId` | string | リクエストのチャンネルID |
| `startTime` | number | リクエストの開始時刻 |
| `endTime` | number | リクエストの終了時刻 |
| `commentCount` | number | 取得したコメント総数 |
| `retrievedCount` | number | DPlayer形式に変換したコメント数 |
| `comments` | array | DPlayer形式のコメント配列 |

#### コメント オブジェクト

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `time` | number | コメント表示時刻（秒単位、開始時刻からの相対時間） |
| `type` | string | コメント種類：`"normal"`, `"top"`, `"bottom"` |
| `size` | string | コメントサイズ：`"small"`, `"medium"`, `"big"` |
| `color` | string | コメント色（ニコ動色番号、例："184", "red"） |
| `author` | string\|null | 投稿者ID（匿名の場合は `null`） |
| `text` | string | コメント内容 |

#### エラーレスポンス

```json
{
  "status": "failed",
  "message": "エラー: チャンネルIDが見つかりません"
}
```

## ファイル構成

```
kakolog/
├── dto/
│   ├── get-comments.dto.ts         // リクエストDTO定義
│   ├── comment-response.dto.ts     // レスポンスDTO定義
│   └── index.ts                    // エクスポート
├── services/
│   ├── kakolog-api.service.ts      // Kakolog API呼び出し
│   ├── kakolog-comment.service.ts  // コメント取得・変換
│   └── index.ts                    // エクスポート
├── types/
│   └── kakolog.types.ts            // Kakolog固有の型定義
├── utils/
│   └── convert-to-dplayer.ts       // DPlayer形式への変換処理
├── kakolog.controller.ts           // APIエンドポイント
├── kakolog.module.ts               // モジュール定義
└── README.md                        // このファイル
```

## 主要な処理フロー

### 1. API呼び出し（kakolog-api.service.ts）

- Jikkyo API にリクエストを送信
- `https://jikkyo.tsukumijima.net/api/kakolog/{channelId}` エンドポイントを使用
- クエリパラメータ: `starttime`, `endtime`, `format=json`

**リクエスト例:**
```
https://jikkyo.tsukumijima.net/api/kakolog/jk1?starttime=1700000000&endtime=1700003600&format=json
```

### 2. JSON解析

APIレスポンスはJSON配列形式で、以下のようなコメントオブジェクトが含まれます

```json
[
  {
    "thread": "1492023606",
    "no": 19886,
    "vpos": 0,
    "date": 1700000000,
    "mail": "184",
    "user_id": "SlF_cF2J1CdotJTaojvbM9mDYAE",
    "anonymity": 1,
    "content": "てか無料期間中に見れば無料やん"
  }
]
```

### 3. 時間範囲フィルタリング

startTime ≤ date ≤ endTime のコメントのみを抽出

### 4. DPlayer形式への変換

Kakolog 形式 → DPlayer 互換形式

**属性変換ロジック:**

- `time`: Unix timestamp → 相対秒数（startTime からの差分）
- `type`: `mail` 属性を解析
  - `"ue"` / `"top"` → `"top"`
  - `"shita"` / `"bottom"` → `"bottom"`
  - それ以外 → `"normal"`
- `size`: `mail` 属性を解析
  - `"big"` → `"big"`
  - `"small"` → `"small"`
  - デフォルト → `"medium"`
- `color`: `mail` 属性から抽出（例："184"）
- `author`: `anonymity == 1` なら `null`、それ以外は `user_id`

## エラーハンドリング

| エラー | HTTPステータス | メッセージ |
|--------|----------------|-----------|
| channelId 未指定 | 400 | "channelId 必須" |
| startTime >= endTime | 400 | "startTime は endTime より小さい値である必要があります" |
| API 呼び出し失敗 | 400 | "エラー: {エラーメッセージ}" |
| XML 解析失敗 | 400 | "エラー: {エラーメッセージ}" |

## 使用例

### cURL でのテスト

```bash
curl -X POST http://localhost:3000/api/kakolog/download/comments \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "jk1",
    "startTime": 1700000000,
    "endTime": 1700003600
  }'
```

### TypeScript での使用

```typescript
import { KakologCommentService } from './kakolog/services';

constructor(private kakologCommentService: KakologCommentService) {}

async getComments() {
  const comments = await this.kakologCommentService.fetchComments(
    'CH321',
    1234567890,
    1234567900,
  );
  const dplayerComments = this.kakologCommentService.convertToDPlayerFormat(
    comments,
    1234567890,
  );
}
```

## 参考資料

- [Jikkyo API](https://jikkyo.tsukumijima.net/)
- [2ch実況](https://ikioi.zz.vc/)
- DPlayer フォーマット（ニコ動実装参照）

## ログ出力例

```
[debug] コメント取得開始: CH321 {
  "channelId": "CH321",
  "startTime": 1234567890,
  "endTime": 1234567900
}
[info] Kakolog コメント取得完了: 42件 {
  "channelId": "CH321",
  "commentCount": 42
}
[info] DPlayer形式への変換完了: CH321 {
  "originalCount": 42,
  "convertedCount": 42
}
```

## 注意事項

1. **レート制限**: Kakolog API のレート制限に注意してください
2. **タイムアウト**: 大量コメント取得時は 30 秒のタイムアウトを考慮
3. **時刻の精度**: Unix timestamp（秒単位）で処理します
4. **匿名コメント**: `author` が `null` の場合、投稿者IDは表示されません
