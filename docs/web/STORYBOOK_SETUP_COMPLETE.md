# Storybook + MSW 統合完了レポート

このドキュメントは、Storybookとmsw（Mock Service Worker）の統合が完了したことを確認します。

## ✅ 完了したセットアップ

### 1. Storybookパッケージインストール
- ✅ `@storybook/react` v10.6.0
- ✅ `@storybook/nextjs` v10.6.0
- ✅ `@storybook/addon-essentials` v8.6.14
- ✅ `@storybook/addon-interactions` v8.6.14
- ✅ `@storybook/addon-onboarding` v10.6.0
- ✅ `@storybook/blocks` v8.6.14
- ✅ `@storybook/test` v8.6.15

### 2. MSW統合パッケージ
- ✅ `msw` v2.15.0
- ✅ `msw-storybook-addon` v3.0.3
- ✅ `msw-auto-mock` v0.32.1 (OpenAPI → MSW生成用)
- ✅ `@faker-js/faker` v10.6.0

### 3. 設定ファイル作成
- ✅ `.storybook/main.ts` - Storybook設定
- ✅ `.storybook/preview.ts` - MSW初期化
- ✅ `components/**/*.stories.tsx` - ストーリーファイル

### 4. ストーリー作成
- ✅ `GoogleButton.stories.tsx` - Google ログインボタン
- ✅ `MicrosoftButton.stories.tsx` - Microsoft ログインボタン
- ✅ `DrivesManagement.stories.tsx` - ドライブ管理コンポーネント

### 5. npm scripts追加
- ✅ `npm run storybook` - 開発サーバー起動
- ✅ `npm run build-storybook` - 本番ビルド

### 6. Makefileコマンド追加
- ✅ `make storybook-dev` - Storybook開発サーバー起動
- ✅ `make storybook-build` - Storybook本番ビルド

## 📊 ファイル構成

```
apps/web/
├── .storybook/
│   ├── main.ts                    # Storybook設定
│   └── preview.ts                 # MSW統合設定
├── components/
│   ├── button/
│   │   ├── GoogleButton.tsx
│   │   ├── GoogleButton.stories.tsx
│   │   ├── MicrosoftButton.tsx
│   │   └── MicrosoftButton.stories.tsx
│   ├── DrivesManagement.tsx
│   └── DrivesManagement.stories.tsx
├── mocks/
│   ├── browser.js                 # ブラウザ用MSWセットアップ
│   ├── handlers.js                # 自動生成APIハンドラー
│   ├── node.js                    # Node.js用セットアップ
│   └── native.js                  # ネイティブ用セットアップ
├── package.json                   # Storybookスクリプト追加
├── MSW_README.md                  # MSW使用ガイド
└── STORYBOOK_MSW_SETUP.md        # Storybook+MSW統合ガイド
```

## 🚀 使用方法

### Storybook開発サーバー起動

```bash
# Option 1: npm script
cd apps/web
npm run storybook

# Option 2: Makeコマンド
make storybook-dev
```

**URL:** `http://localhost:6006`

### Storybook本番ビルド

```bash
# Option 1: npm script
npm run build-storybook

# Option 2: Makeコマンド
make storybook-build
```

## 📋 作成されたストーリー

### 1. GoogleButton ストーリー
- **Default** - デフォルト状態
- **Loading** - ローディング中
- **Disabled** - 無効化状態
- **CustomLabel** - カスタムラベル
- **WithMSWIntegration** - MSW連携例

### 2. MicrosoftButton ストーリー
- **Default** - デフォルト状態
- **Loading** - ローディング中
- **Disabled** - 無効化状態
- **CustomLabel** - カスタムラベル
- **WithMSWIntegration** - MSW連携例

### 3. DrivesManagement ストーリー
- **Default** - 複数ドライブ表示
- **NoDrives** - ドライブ無し（カスタムハンドラー）
- **Loading** - ローディング中
- **ErrorState** - エラー状態（HTTP 500）
- **WithCustomDrives** - カスタムデータ表示
- **UnauthorizedError** - 認証エラー（HTTP 401）
- **NetworkTimeout** - ネットワークタイムアウト

## 🔌 MSW統合の特徴

### グローバルハンドラー
`.storybook/preview.ts` で定義したMSWハンドラー（`mocks/handlers.js`）は、すべてのストーリーで利用可能です。

```typescript
const preview: Preview = {
  parameters: {
    msw: {
      handlers: handlers, // OpenAPI仕様から自動生成
    },
  },
  loaders: [mswLoader],
};
```

### ストーリー固有のハンドラー
特定のストーリーで異なるレスポンスを返す場合：

```typescript
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/drives', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};
```

## 📖 ドキュメント

### Storybook + MSW統合ガイド
詳細な使用方法とベストプラクティスについては、以下を参照してください：

- **`STORYBOOK_MSW_SETUP.md`** - 完全な統合ガイド
- **`MSW_README.md`** - MSWの使用方法

## 🔧 開発フロー

1. **コンポーネント開発**
   ```bash
   npm run dev
   ```

2. **ストーリー作成・編集**
   ```bash
   make storybook-dev
   ```

3. **MSWハンドラー再生成**（OpenAPI更新時）
   ```bash
   make generate-msw
   ```

4. **すべてのクライアント再生成**
   ```bash
   make generate-all-clients
   ```

## 🐛 トラブルシューティング

### Storybook起動に失敗する場合

```bash
# キャッシュをクリアして再起動
rm -rf node_modules/.cache
npm run storybook
```

### MSWハンドラーが実行されない場合

1. ブラウザのDevToolsで確認
2. Network タブでリクエストが表示されているか確認
3. `.storybook/preview.ts` でハンドラーが正しく読み込まれているか確認

### パッケージの依存関係エラー

インストール時に `--legacy-peer-deps` が使用されました：

```bash
npm install --legacy-peer-deps --save-dev @storybook/react@latest
```

## 📚 参考資料

- [Storybook 公式ドキュメント](https://storybook.js.org/)
- [MSW 公式ドキュメント](https://mswjs.io/)
- [msw-storybook-addon GitHub](https://github.com/mswjs/msw-storybook-addon)
- [Next.js + Storybook](https://storybook.js.org/docs/get-started/frameworks/nextjs)

## 🎯 次のステップ

1. **コンポーネントのストーリー追加**
   - 既存のコンポーネント（`Sidebar`, `DriveSelector`等）にストーリーを追加

2. **テストの追加**
   - `@storybook/test` を使用したインタラクションテスト

3. **Chromatic統合**（オプション）
   - Storybookのビジュアル回帰テストホスティング

4. **CI/CD統合**
   - GitHub Actionsで自動ビルド・デプロイ

## ✨ 利点

✅ **コンポーネント開発の加速**
- ブラウザで即座に視覚的フィードバック

✅ **API モッキングの完全自動化**
- OpenAPI仕様から自動生成
- リアルなテストデータ（Faker.js）

✅ **ドキュメント自動生成**
- Props の自動ドキュメント化
- インタラクション例の表示

✅ **CI/CD対応**
- 本番ビルド機能
- スクリーンショット比較可能

---

**セットアップ完了日:** 2026/09/28
**Storybook バージョン:** 10.6.0
**MSW バージョン:** 2.15.0
