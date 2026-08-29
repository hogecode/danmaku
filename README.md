# Danmaku Video Player App - ドキュメント



---

## 🏗️ アーキテクチャ概要

### システム構成

```
┌─────────────────────────────────────────┐
│     クライアント層                       │
│  (Web: Next.js / Mobile: Flutter)       │
└────────────┬────────────────────────────┘
             │
      ┌──────▼──────────┐
      │ Cloudflare CDN  │
      └──────┬──────────┘
             │
  ┌──────────▼──────────┐
  │  AWS ECS Fargate    │
  │  (NestJS Server)    │
  └──────────┬──────────┘
             │
   ┌─────────▼─────────┐
   │ Google Drive API  │
   └───────────────────┘
```

### 主要な技術スタック

| 層 | 技術 |
|----|-----|
| **Web** | Next.js 14 + React + DPlayer |
| **Mobile** | Flutter + Custom Canvas Player |
| **Backend** | NestJS + Node.js |
| **CDN** | Cloudflare |
| **Infra** | AWS ECS Fargate + ALB |
| **CI/CD** | GitHub Actions |
| **Reverse Proxy** | Caddy |
| **Container Orchestration** | Docker Compose (dev) / ECS Fargate (prod) |

---

## 🐳 Docker セットアップ

### 開発環境

開発環境では **Docker Compose** を使用して、ホットリロード対応の完全な開発環境を提供します。

```bash
# セットアップ
docker-compose up -d

# サービスアクセス
# - フロントエンド: http://localhost:3000 または http://web.local
# - バックエンド: http://localhost:3001 または http://api.local:8080
# - Swagger Docs: http://localhost:3001/api/docs
```

**詳細**: [DOCKER_DEV_SETUP.md](./DOCKER_DEV_SETUP.md)

### 本番環境

本番環境では **AWS ECS Fargate** を使用してスケーラブルなデプロイを実現します。

```bash
# イメージビルド
docker build -f server/Dockerfile -t danmaku-server:latest ./server
docker build -f apps/web/Dockerfile -t danmaku-web:latest ./apps/web

# ECR にプッシュ
docker push <REGISTRY>/danmaku-server:latest
docker push <REGISTRY>/danmaku-web:latest
```

**詳細**: [FARGATE_DEPLOYMENT.md](./FARGATE_DEPLOYMENT.md)

### Dockerfile 構成

| ファイル | 環境 | 用途 |
|---------|------|------|
| `server/Dockerfile` | 本番 | NestJS バックエンド (マルチステージビルド) |
| `server/Dockerfile.dev` | 開発 | NestJS (ホットリロード) |
| `apps/web/Dockerfile` | 本番 | Next.js フロントエンド (最適化) |
| `apps/web/Dockerfile.dev` | 開発 | Next.js (ホットリロード) |
| `Caddyfile` | 開発/本番 | リバースプロキシ設定 |

### リバースプロキシ (Caddy) - HTTPS 完全対応

Caddy により複数のサービスを統一的にルーティング、HTTPS にも対応:

```
開発環境（自己署名証明書自動生成）:
  https://web.local     → Next.js (3000)
  https://api.local     → NestJS (3001)
  https://localhost     → Next.js (Caddy)

本番環境（Let's Encrypt 自動更新）:
  https://yourdomain.com     → Next.js
  https://api.yourdomain.com → NestJS
```

**詳細**: [HTTPS_SETUP.md](./HTTPS_SETUP.md)

---

## 🚀 クイックスタート

### 1. 環境変数を設定

```bash
cp .env.example .env
cd server && cp .env.example .env && cd ..
```

### 2. Docker Compose で起動

```bash
docker-compose up -d
```

### 3. ブラウザでアクセス

- フロントエンド: http://localhost:3000
- API Docs: http://localhost:3001/api/docs

### 4. コード編集でホットリロード

ファイルを保存すると自動的に再ビルド・リロードされます。


