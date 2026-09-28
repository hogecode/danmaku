# MSW (Mock Service Worker) セットアップガイド

このプロジェクトでは、OpenAPI仕様から自動的にMSWのモックハンドラーを生成しています。

## 概要

- **MSW**: Mock Service Worker - ネットワークリクエストをインターセプトするモッキングライブラリ
- **msw-auto-mock**: OpenAPI YAMLからMSWハンドラーを自動生成するツール
- **@faker-js/faker**: リアルなモックデータ生成

## ファイル構造

```
apps/web/
├── mocks/
│   ├── browser.js         # ブラウザワーカーのセットアップ
│   ├── handlers.js        # 自動生成されたAPIハンドラー（編集可能）
│   ├── node.js            # Node.js環境用のセットアップ
│   └── native.js          # ネイティブ環境用のセットアップ
├── openapi.yaml           # サーバーのOpenAPI仕様（server/から複製）
└── package.json
```

## 生成方法

### 個別実行
```bash
make generate-msw
```

### すべてのクライアント生成（Web + Mobile + Flutter + MSW）
```bash
make generate-all-clients
```

## 生成されるハンドラー

### handlers.js
自動生成されるMSWハンドラーファイルで、以下の特徴があります：

- ✅ OpenAPI仕様に基づくエンドポイント自動生成
- ✅ Faker.jsを使用したリアルなモックデータ生成
- ✅ 複数のレスポンスパターン対応（複数のステータスコード）
- ✅ リクエストボディのエコー機能（オプション）
- ✅ 編集可能（自動生成時に上書きされない設定がある）

## Next.jsへの統合（実装予定）

MSWをNext.jsアプリケーションで使用するには、以下の手順を実行します：

1. **ブラウザワーカーの初期化**

```typescript
// app/layout.tsx または pages/_app.tsx
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    // ブラウザ環境でのみワーカーを初期化
    if (typeof window !== 'undefined') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start()
      })
    }
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

2. **環境変数の設定（オプション）**

`.env.local`でモックAPIの有効/無効を切り替え可能：

```env
# .env.local
NEXT_PUBLIC_USE_MSW=true
```

## ハンドラーのカスタマイズ

`handlers.js`は編集可能で、特定のエンドポイントのレスポンスをカスタマイズできます：

```javascript
// handlers.jsでカスタムハンドラーを追加
export const handlers = [
  // 自動生成されたハンドラー...
  
  // カスタムハンドラー
  http.get('/api/custom', () => {
    return HttpResponse.json({ custom: 'data' }, { status: 200 })
  }),
]
```

## パッケージ管理

- **MSW**: `npm install msw`
- **msw-auto-mock**: `npm install --save-dev msw-auto-mock`
- **@faker-js/faker**: `npm install --save-dev @faker-js/faker`

すでにインストール済みの場合は、新しいバージョンに更新可能：

```bash
npm update msw msw-auto-mock @faker-js/faker
```

## トラブルシューティング

### ハンドラーが機能しない場合

1. ブラウザコンソールを確認してMSWが起動しているか確認
2. DevToolsで「Network」タブからリクエストが正しくインターセプトされているか確認
3. ハンドラーのURL（baseURL）が正しいか確認

### OpenAPI仕様の更新後

OpenAPI仕様を更新した場合、以下のコマンドで再生成：

```bash
make generate-msw
```

既存のカスタマイズは保持されます。

## 参考リンク

- [MSW 公式ドキュメント](https://mswjs.io/)
- [msw-auto-mock GitHub](https://github.com/zoubingwu/msw-auto-mock)
- [faker.js 公式サイト](https://fakerjs.dev/)
- [OpenAPI Specification](https://spec.openapis.org/)
