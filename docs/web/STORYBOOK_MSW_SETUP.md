# Storybook + MSW 統合ガイド

このプロジェクトではStorybookとMSW（Mock Service Worker）を統合しており、ストーリー内でモックAPIを完全にシミュレートできます。

## セットアップ完了項目

✅ **Storybookインストール**
- `@storybook/react` - React用Storybook
- `@storybook/nextjs` - Next.js用ビルダー
- `@storybook/addon-essentials` - 基本アドオン
- `@storybook/addon-interactions` - インタラクション検証

✅ **MSW統合**
- `msw` - Mock Service Worker
- `msw-storybook-addon` - Storybook用MSWアダプター
- `mocks/handlers.js` - 自動生成されたAPIハンドラー

## Storybookの起動

```bash
# 開発モード（ホットリロード有効）
npm run storybook

# 本番向けビルド
npm run build-storybook
```

Storybook UIは `http://localhost:6006` で利用可能です。

## ストーリー内でMSWハンドラーを使用する方法

### 基本的な使用例

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';
import { http, HttpResponse } from 'msw';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    msw: {
      handlers: [
        // MSWハンドラーをここに定義
        http.get('/api/data', () => {
          return HttpResponse.json({ data: 'Mock Data' });
        }),
      ],
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

### グローバルハンドラーの使用

`.storybook/preview.ts` で定義したハンドラーは全ストーリーで利用可能です：

```typescript
// .storybook/preview.ts
import { handlers } from '../mocks/handlers';

const preview: Preview = {
  parameters: {
    msw: {
      handlers: handlers, // OpenAPI仕様から自動生成されたハンドラー
    },
  },
};
```

### ストーリー固有のハンドラーオーバーライド

特定のストーリーで異なるレスポンスを返す場合：

```typescript
export const WithError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data', () => {
          return HttpResponse.json(
            { error: 'Not Found' },
            { status: 404 }
          );
        }),
      ],
    },
  },
};
```

## MSW自動生成ハンドラー

OpenAPI仕様から自動生成されたハンドラーは `mocks/handlers.js` に保存されています。

### サポートされるエンドポイント例

- `POST /api/auth/login/{provider}` - プロバイダー別ログイン
- `GET /api/auth/me` - ユーザー情報取得
- `POST /api/auth/logout` - ログアウト
- `POST /api/kakolog/download/comments` - コメントダウンロード
- `POST /api/nicovideo/download/comments` - ニコニココメントダウンロード

各エンドポイントはFaker.jsで生成されたリアルなモックデータを返します。

## デバッグ

### NetworkタブでMSWのインターセプト確認

1. Storybookを開く
2. ブラウザのDevTools → Network タブを開く
3. コンポーネントとやり取りすると、MSWがインターセプトしたリクエストが表示されます
4. ステータスコード200で、レスポンスボディにモックデータが含まれます

### コンソールログの確認

MSWハンドラー実行時のログは、Storybook右パネルの「Interactions」タブで確認できます。

```typescript
// ハンドラー内でログ出力
http.get('/api/test', ({ request }) => {
  console.log('Request URL:', request.url);
  return HttpResponse.json({ success: true });
}),
```

## ハンドラーのカスタマイズ

### 既存ハンドラーをオーバーライド

```typescript
import { handlers } from '../mocks/handlers';
import { http, HttpResponse } from 'msw';

export const CustomHandler: Story = {
  parameters: {
    msw: {
      handlers: [
        ...handlers,
        // 既存のハンドラーをオーバーライド
        http.get('/api/auth/me', () => {
          return HttpResponse.json({
            id: 'custom-user',
            name: 'Custom User',
          });
        }),
      ],
    },
  },
};
```

### 新しいハンドラーを追加

```typescript
export const WithAdditionalHandler: Story = {
  parameters: {
    msw: {
      handlers: [
        ...handlers,
        http.get('/api/custom', () => {
          return HttpResponse.json({ custom: 'data' });
        }),
      ],
    },
  },
};
```

## リクエストボディのエコー

自動生成ハンドラーは `shouldEchoRequestBody` フラグで、リクエストボディをレスポンスに含めるようにできます：

```typescript
// mocks/handlers.js 内
const shouldEchoRequestBody = true; // リクエストボディをエコー

const responseJson =
  requestJson && body && typeof body === 'object' && !Array.isArray(body)
    ? { ...body, ...requestJson } // ボディをマージ
    : body;
```

## ベストプラクティス

### 1. ストーリーファイルの命名

```
ComponentName.stories.tsx
├── Default       - デフォルト状態
├── Loading       - ローディング中
├── Error         - エラー状態
├── WithMSW       - MSW連携例
└── CustomHandler - カスタムハンドラー例
```

### 2. MSWハンドラーの組織化

```typescript
// mocks/handlers.ts - 自動生成
export const handlers = [/* ... */];

// stories/mockHandlers.ts - ストーリー用カスタムハンドラー
export const authHandlers = [
  http.post('/api/auth/login/{provider}', () => {
    return HttpResponse.json({ success: true });
  }),
];
```

### 3. 型安全性の確保

```typescript
import type { StoryObj } from '@storybook/react';
import type { HttpHandler } from 'msw';

const customHandlers: HttpHandler[] = [
  // ハンドラー定義
];
```

## トラブルシューティング

### MSWハンドラーが実行されない

1. **Storybookを再起動する**
   ```bash
   npm run storybook
   ```

2. **DevToolsのNetworkタブを確認**
   - リクエストが実際に送信されているか確認
   - MSWがハンドラーをインターセプトしているか確認

3. **ハンドラーのURL形式を確認**
   ```typescript
   // ❌ 間違い
   http.get('http://localhost:3000/api/data', ...)
   
   // ✅ 正しい
   http.get('/api/data', ...)
   ```

### ハンドラーがグローバルに適用されない

`.storybook/preview.ts` で正しくインポートされているか確認：

```typescript
import { handlers } from '../mocks/handlers';

const preview: Preview = {
  parameters: {
    msw: {
      handlers: handlers, // ✅ 正しく参照されている
    },
  },
};
```

### パッケージのバージョン競合

`npm install --legacy-peer-deps` でインストールしている場合、バージョン互換性の問題が発生する可能性があります。

```bash
# 修正方法
npm install --save-dev @storybook/react@latest @storybook/nextjs@latest
```

## 参考資料

- [Storybook 公式ドキュメント](https://storybook.js.org/)
- [MSW 公式ドキュメント](https://mswjs.io/)
- [msw-storybook-addon](https://github.com/mswjs/msw-storybook-addon)
- [Next.js + Storybook](https://storybook.js.org/docs/get-started/frameworks/nextjs)
