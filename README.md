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


