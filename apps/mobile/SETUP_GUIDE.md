# React Native + Expo + NativeWind セットアップガイド

## 📋 実装状況

### ✅ 完了
1. **パッケージ設定** (`package.json`, `app.json`, `tsconfig.json`)
2. **ユーティリティ層**
   - ロギング (`utils/logger.ts`)
   - トークン保存 (`utils/token-storage.ts`)
   - 定数 (`utils/constants.ts`)
3. **型定義** (`types/index.ts`)
4. **状態管理** (Zustand)
   - `stores/auth-store.ts`
   - `stores/drive-store.ts`
   - `stores/video-store.ts`
5. **API サービス層**
   - `services/auth-service.ts`
   - `services/drive-service.ts`
   - `services/video-service.ts`
6. **カスタムフック**
   - `hooks/use-auth.ts`
   - `hooks/use-drive.ts`
   - `hooks/use-video.ts`
7. **ページレイアウト** (`app/_layout.tsx`)
8. **ログイン画面** (`app/login.tsx`)
9. **ホーム画面** (`app/home.tsx`)
10. **インデックス** (`app/index.tsx`)
11. **動画再生ページ** (`app/player/[id].tsx`)

### 📝 次のステップ

```bash
# 1. 依存パッケージをインストール
cd apps/mobile
npm install

# 2. ネイティブビルドをセットアップ（Android）
eas build --platform android --local

# 3. アプリを起動（開発モード）
npm run android  # または npm run ios

# 4. Deep link テスト
# 実機でシミュレート: adb shell am start -a android.intent.action.VIEW -d "danmaku://auth-callback?token=xxx&user_info={...}"
```

## 🔌 Flutter との重要な違い

| 項目 | Flutter | React Native |
|------|---------|------------|
| **状態管理** | Riverpod | Zustand |
| **スタイリング** | Flutter テーマ | NativeWind (Tailwind) |
| **ナビゲーション** | GoRouter | Expo Router (File-based) |
| **API クライアント** | Dio + OpenAPI 生成 | Axios |
| **トークン保存** | flutter_secure_storage | expo-secure-store |
| **Deep Link** | go_router の自動処理 | expo-linking の手動処理 |

## 🐛 既知の問題と対策

### 1. react-native-video が Web で動作しない
→ Platform.OS === 'web' で HTML5 `<video>` を使用

### 2. NativeWind が完全に統合されていない
→ StyleSheet を主に使用

### 3. XML コメントパースが簡易版
→ 本番前に複数フォーマット対応を追加

## 📲 マニュアル Deep Link テスト

### Android
```bash
adb shell am start -a android.intent.action.VIEW -d "danmaku://auth-callback?token=test_token_123&user_info=%7B%22id%22:%22user123%22,%22name%22:%22Test%20User%22%7D"
```

### iOS
```bash
xcrun simctl openurl booted "danmaku://auth-callback?token=test_token_123&user_info=%7B%22id%22:%22user123%22,%22name%22:%22Test%20User%22%7D"
```

## 🔑 環境変数

`.env` ファイルを作成（本番前に）：
```env
API_BASE_URL=http://api.danmaku.cloud:3001
```

## 🧪 テスト計画

1. **Unit Tests** (Jest)
   - util 関数
   - store アクション
   - service メソッド

2. **Integration Tests** (Detox)
   - ログイン → ホーム → 動画再生フロー
   - Deep link ハンドリング

3. **E2E Tests** (playwright/web)
   - Web ビルドの検証

## 📚 参考資料

- [Expo Router 公式](https://docs.expo.dev/router/introduction/)
- [Zustand 公式](https://github.com/pmndrs/zustand)
- [NativeWind 公式](https://www.nativewind.dev/)
- [React Native Video](https://react-native-video.github.io/)

## ✏️ 今後の改善

- [ ] コンポーネント分割（Danmaku, VideoPlayer など）
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化（メモ化）
- [ ] i18n サポート
- [ ] テスト充実
- [ ] CI/CD パイプライン構築
