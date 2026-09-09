# React Native + Expo + NativeWind 実装進捗

## ✅ 完了したフェーズ

### フェーズ 1: 必須パッケージ追加 ✅
- ✅ `nativewind`, `zustand`, `axios`
- ✅ `expo-web-browser`, `expo-secure-store`
- ✅ `react-native-video` for video playback

### フェーズ 2: ディレクトリ構造 ✅
```
src/
├── app/                    # Expo Router ページ
├── stores/                 # Zustand 状態管理
├── services/               # API サービス層
├── hooks/                  # カスタムフック
├── components/             # UI コンポーネント
├── types/                  # 型定義
└── utils/                  # ユーティリティ
```

### フェーズ 3: 状態管理（Zustand） ✅
- ✅ `auth-store.ts` - 認証状態
- ✅ `drive-store.ts` - Google Drive ファイル一覧
- ✅ `video-store.ts` - ビデオプレイヤー設定

### フェーズ 4: サービス層 ✅
- ✅ `auth-service.ts` - OAuth & ユーザー情報
- ✅ `drive-service.ts` - Google Drive API
- ✅ `video-service.ts` - ビデオトークン & ストリーミング

### フェーズ 5: カスタムフック ✅
- ✅ `use-auth.ts` - 認証ロジック
- ✅ `use-drive.ts` - Google Drive ロジック
- ✅ `use-video.ts` - ビデオプレイヤーロジック

### フェーズ 6: UI ページ - 進行中
- ✅ `_layout.tsx` - ルートレイアウト
- ✅ `login.tsx` - Google OAuth ログイン（Deep link 対応）
- 🔄 `index.tsx` - ホーム画面（Google Drive ファイル一覧）
- ⏳ `player/[id].tsx` - 動画再生（弾幕表示）

## 📋 次のステップ

### 1. ホーム画面 (`index.tsx`) - サイズ制限回避
分割して小ファイルで実装

### 2. 動画再生ページ (`player/[id].tsx`)
- ビデオプレイヤー （react-native-video）
- 弾幕表示コンポーネント
- XML コメントパース

### 3. コンポーネント類
- VideoPlayer.tsx
- DanmakuOverlay.tsx
- FileItem.tsx

### 4. テスト & 動作確認
- トークン保存/取得
- Deep link ハンドリング
- API 通信

## 🔍 構成図

```
Login Screen
    ↓ (Google OAuth)
Home Screen (Google Drive Files)
    ↓ (Select Folder/Video)
Player Screen (Video + Danmaku)
```

## 📝 APIエンドポイント対応

- `POST /api/auth/login` ✅ - OAuth URL 取得
- `GET /api/auth/me` ✅ - ユーザー情報
- `POST /api/auth/logout` ✅ - ログアウト
- `GET /api/gdrive/list` ✅ - フォルダ内容
- `GET /api/gdrive/search` ✅ - ファイル検索
- `POST /api/auth/video-token` ✅ - ビデオトークン
- `GET /api/player/stream/:fileId` ✅ - ストリーミング URL
- `GET /api/comments/:fileId` ⏳ - コメント取得

## 🚀 実行方法

```bash
cd apps/mobile
npm install
npm run android  # または ios / web
```

## ⚠️ 既知の制限

1. NativeWind は web で完全対応していない
2. react-native-video はWeb非対応（HTML5 Video を使用）
3. XML コメントパースは簡素化版
4. Deep link はプラットフォーム固有の設定が必要

## 🔗 参考資料

- Flutter コード: `apps/desktop/lib/`
- OpenAPI モデル: `apps/desktop/lib/data/client/lib/model/`
