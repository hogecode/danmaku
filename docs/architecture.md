# システムアーキテクチャ設計書

## 1. プロジェクト概要

### 1.1 プロジェクト名
**Danmaku Video Player App**

### 1.2 目的・ゴール
Google Drive 内のビデオファイルを、iPhoneの Documents アプリのように階層的にブラウズでき、かつニコニコ動画風の弾幕（コメント）を表示しながら再生できるクロスプラットフォームアプリケーション。

### 1.3 スコープ
- Google Drive のファイル・フォルダ閲覧機能
- MP4 ビデオのストリーミング再生
- JSON , XMLフォーマットのコメント（弾幕）表示
- Web 版（Next.js + DPlayer）と Mobile 版（Flutter）の 2 プラットフォーム
- 単一ユーザーの利用想定

### 1.4 プロジェクト方針
- **単人ユーザー**: コメント送信機能は不要（受信のみ）
- **シンプル設計**: OAuth 認証はサーバー側で完結
- **クロスプラットフォーム**: Web と Mobile で同じ UX を提供
- **CDN 活用**: Cloudflare でグローバルな高速配信

---

## 2. システムアーキテクチャ図

### 2.1 全体構成

```
┌───────────────────────────────────────────────────────────────┐
│           クライアント層（Web + Mobile）                       │
├───────────────────────────────────────────────────────────────┤
│  Next.js 14              │              Flutter               │
│  - Folder Browser        │              - Folder Browser      │
│  - DPlayer              │              - Custom Player       │
│  - Danmaku (DPlayer)    │              - Canvas Danmaku      │
└────────────┬─────────────┴──────────────┬──────────────────────┘
             │                           │
             └───────────────┬───────────┘
                             │
                     ┌───────▼──────────┐
                     │ Cloudflare CDN   │
                     │ - キャッシング    │
                     │ - DDoS防御       │
                     │ - グローバル配信 │
                     └───────┬──────────┘
                             │
        ┌────────────────────▼───────────────────┐
        │  AWS ECS Fargate (NestJS Server)       │
                    │
        └────────────────────┬───────────────────┘
                             │
        ┌────────────────────▼──────────────────┐
        │   Google Drive API                    │
        │   - Files / Folders                   │
        │   - Media Export / Streaming          │
        │   - OAuth 2.0                         │
        └───────────────────────────────────────┘
```

---

## 3. コンポーネント説明

### 3.1 フロントエンド層



### 3.3 CDN・インフラ

#### Cloudflare CDN
- 動画ストリーミング: 24 時間キャッシング
- Range ヘッダー対応: チャンク転送完全サポート
- 圧縮: Brotli による自動圧縮
- セキュリティ: DDoS 防御・ヘッダー管理

#### AWS ECS Fargate
- Task: 0.5 vCPU / 1 GB RAM
- Auto Scaling: CPU > 70%
- Logging: CloudWatch へ自動出力
- リージョン: ap-northeast-1（東京）
- 冗長性: マルチ AZ 構成

---

## 4. 技術スタック

| 層 | 技術 | バージョン |
|----|------|---------|
| **Web** | Next.js | 14.x |
| | React | 18.x |
| | DPlayer | 1.33+ |
| | Axios | 1.x |
| **Mobile** | Flutter | 3.24+ |
| | video_player | 2.x |
| | provider | 6.x |
| **Backend** | NestJS | 10.x |
| | Node.js | 20.x LTS |
| | googleapis | 118.x |
| **Infra** | Docker | Latest |
| | ECS Fargate | - |
| | Cloudflare CDN | - |
| | GitHub Actions | - |

---

## 5. ユースケース

### 5.1 フォルダ・ファイル閲覧
1. ユーザーがアプリを起動
2. Google OAuth ログイン
3. GDrive ルートフォルダ内のアイテム表示
4. ユーザーがフォルダをタップ → フォルダ内に移動
5. .mp4 ファイルを検出・リスト表示

### 5.2 動画再生
1. ユーザーが .mp4 ファイルをタップ
2. プレイヤー画面に遷移
3. サーバーからビデオストリーム取得
4. 同フォルダから {fileId}.json コメント自動読み込み
5. 動画再生 + 弾幕表示


---

## 
---

## 7. 非機能要件

### 7.1 パフォーマンス
- ファイル一覧読み込み: < 1 秒
- 動画再生開始: < 2 秒
- 弾幕描画: 60 FPS
- API レスポンス: < 500ms

### 7.2 スケーラビリティ
- 同時ユーザー: 1（単一利用）
- ファイルサイズ: 最大 10 GB
- コメント数: 最大 10,000 件

### 7.3 可用性
- 稼働率: 99.9%
- リージョン: ap-northeast-1（東京）
- 冗長性: マルチ AZ

### 7.4 セキュリティ
- 認証: Google OAuth 2.0（PKCE Flow）
- トークン: サーバー側で秘密管理
- 通信: HTTPS（TLS 1.3+）
- 入力検証: JSON パース時のチェック

---

## 8. デプロイメント

### 8.1 Web 版
```
GitHub (main branch)
  → GitHub Actions (build & test)
```

### 8.2 Mobile 版
```
flutter build ios --release     → App Store
flutter build apk --release     → Google Play
```

### 8.3 Server 版
```
GitHub (main branch)
  → GitHub Actions (test, lint, build)
  → Docker Build & ECR Push
  → ECS Task Definition Update
  → Service Restart
  → CloudWatch Logs
```

---

**バージョン**: 1.0  
**作成日**: 2026-08-29
