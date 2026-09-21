# Danmaku Video Player App - ドキュメント

https://danmaku.cloud

---

## 🏗️ アーキテクチャ概要

### システム構成

```
┌─────────────────────────────────────────┐
│     クライアント層                       │
│  (Next.js / React Native / Flutter)       │
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
| **mobile** | React Native + Custom Video Player |
| **desktop** | Flutter + Custom Video Player |
| **Backend** | NestJS + Node.js |
| **CDN** | Cloudflare |
| **Infra** | AWS ECS Fargate + ALB |
| **CI/CD** | GitHub Actions |
| **Reverse Proxy** | Caddy |
| **Container Orchestration** | Docker Compose (dev) / ECS Fargate (prod) |



