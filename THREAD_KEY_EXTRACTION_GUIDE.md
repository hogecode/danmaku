# ThreadKey 取得ガイド

## 概要
`thread_key`はニコ動のコメント取得に必須のパラメータです。**ビデオページのHTMLに埋め込まれたJSONから抽出**できます。

---

## 取得フロー

### 1️⃣ ビデオページをリクエスト

```typescript
// NicovideoVideoService
async getVideoMetadata(videoId: string): Promise<NicovideVideoMetadata> {
  const htmlResponse = await this.apiClient.getHtml(
    `https://www.nicovideo.jp/watch/${videoId}`
  );
  // ...
}
```

### 2️⃣ HTMLをパース

ビデオページには `<meta name="server-response">` タグがあり、これに **JSON形式のデータが埋め込まれている**。

```html
<meta name="server-response" content="{...large JSON...}" />
```

### 3️⃣ JSONから`thread_key`を抽出

```typescript
// main.py Line 1669-1912 の処理と同じ
const meta = document.querySelector('meta[name="server-response"]');
if (!meta) throw new Error('Video metadata not found');

const responseData = JSON.parse(meta.getAttribute('content'));
const params = responseData.data.response;

// thread_key の取得
const threadKey = params.comment.nvComment.threadKey;  // ✅ これが必須
const commentServer = params.comment.nvComment.server;  // コメントサーバーURL
const threads = params.comment.threads;  // スレッド情報の配列
```

---

## JSONの構造

```json
{
  "data": {
    "response": {
      "video": {
        "id": "sm12345678",
        "title": "...",
        "duration": 120,
        ...
      },
      "comment": {
        "threads": [
          { "id": "1492023606", "fork": "main" },
          { "id": "1492023607", "fork": "easy" }
        ],
        "nvComment": {
          "server": "https://nvcomment.nicovideo.jp",
          "threadKey": "...",  // 👈 これが必須
          "params": {
            "targets": [
              { "id": "1492023606", "fork": "main" }
            ],
            "language": "ja-jp"
          }
        }
      }
    }
  }
}
```

---

## NestJS実装例

### コントローラー（修正版）

```typescript
@Post('download/comments')
async downloadComments(
  @Body() downloadDto: DownloadCommentRequestDto,
  @Res() res: Response,
): Promise<void> {
  const taskId = uuidv4();
  try {
    const videoId = downloadDto.videoId;
    
    // 1️⃣ ビデオメタデータ取得（thread_key も同時に取得）
    const metadata = await this.videoService.getVideoMetadata(videoId);
    
    // 2️⃣ thread_key が含まれているので直接使用可能
    if (!metadata.threadKey) {
      throw new BadRequestException('Thread key not found - video may be private');
    }
    
    // 3️⃣ コメント取得（thread_key を使用）
    const comments = await this.commentService.fetchComments(
      videoId,
      metadata.commentServer,
      metadata.threadKey,
      metadata.threads,
    );
    
    res.json({
      taskId,
      videoId,
      status: 'completed',
      message: 'コメント取得完了',
      data: comments,
    });
  } catch (error) {
    res.status(400).json({ taskId, status: 'failed', message: error.message });
  }
}
```

### ビデオサービス（修正版）

```typescript
async getVideoMetadata(videoId: string): Promise<NicovideVideoMetadata> {
  try {
    // ビデオページ取得
    const htmlResponse = await this.apiClient.getHtml(
      `https://www.nicovideo.jp/watch/${videoId}`
    );
    
    // HTMLパース
    const dom = new JSDOM(htmlResponse);
    const meta = dom.window.document.querySelector('meta[name="server-response"]');
    
    if (!meta) {
      throw new Error(`Video metadata not found for ${videoId}`);
    }
    
    // JSONを抽出
    const responseData = JSON.parse(meta.getAttribute('content') || '{}');
    const params = responseData.data?.response;
    
    if (!params) {
      throw new Error('Invalid response format');
    }
    
    // メタデータを構築
    return {
      id: params.video.id,
      title: params.video.title,
      duration: params.video.duration,
      uploader: params.video.owner.nickname,
      commentCount: params.video.count.comment,
      viewCount: params.video.count.view,
      
      // ✅ コメント取得に必須のパラメータ
      threadKey: params.comment.nvComment.threadKey,
      commentServer: params.comment.nvComment.server,
      threads: params.comment.threads,
      threadParams: params.comment.nvComment.params,
    };
  } catch (error) {
    this.logger.error(`Failed to get video metadata for ${videoId}:`, error);
    throw error;
  }
}
```

### DTOの更新

```typescript
// nicovideo-video-metadata.dto.ts
export class NicovideVideoMetadata {
  id: string;
  title: string;
  duration: number;
  uploader: string;
  commentCount: number;
  viewCount: number;
  
  // ✅ 新しい必須フィールド
  threadKey: string;        // コメント取得に必須
  commentServer: string;    // コメント取得に必須
  threads: Array<{          // スレッド情報
    id: string | number;
    fork: string;
  }>;
  threadParams: {           // スレッドパラメータ
    targets: Array<any>;
    language: string;
  };
}
```

---

## main.py との対応

| main.py | NestJS実装 | 用途 |
|---------|----------|------|
| Line 1669: `document.find("meta", {"name": "server-response"})` | `querySelector('meta[name="server-response"]')` | メタデータ抽出 |
| Line 1912: `params["comment"]["nvComment"]["threadKey"]` | `metadata.threadKey` | コメント取得 |
| Line 1911: `params["comment"]["nvComment"]["server"]` | `metadata.commentServer` | コメントサーバーURL |
| Line 1909: `params["comment"]["threads"]` | `metadata.threads` | スレッド情報 |
| Line 2075-2076: `{"threadKey": thread_key, "params": {...}}` | コメントサービスで使用 | API リクエスト |

---

## 重要なポイント

✅ **セッション不要**
- HTML取得時にセッションクッキーは不要（公開動画なら）
- `thread_key`も同時に取得できる

✅ **プライベート動画**
- `<meta name="server-response">` が見つからない場合は403
- `thread_key` が存在しない場合はコメント取得不可

✅ **実装フロー**
1. `getVideoMetadata()` が HTML から thread_key を抽出
2. コントローラーは そのメタデータを使用
3. コメントサービスが thread_key でコメント取得

---

## コード変更チェックリスト

- [ ] NicovideVideoService: `getVideoMetadata()` で thread_key 抽出
- [ ] NicovideVideoMetadata DTO: threadKey, commentServer, threads 追加
- [ ] コントローラー: thread_key を metadata から取得
- [ ] コメント取得ロジック: thread_key を使用
- [ ] JSDOM または同等のHTMLパーサー をインストール
- [ ] テスト: 公開動画での取得確認

