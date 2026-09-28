# Environment Variables Mapping Guide

## 概要

NestJS バックエンドの環境変数構成：

```
Terraform tfvars (Environment Variables) → AWS Secrets Manager (JSON) → secrets.loader.ts → process.env → validateEnvironment() → NestJS
```

---

## 1. Terraform Environment Variables (prod.tfvars)

Terraform の `nestjs_environment_variables` で設定：

### Node.js & Logging
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `LOG_LEVEL`: `info`
- `LOG_FORMAT`: `json`

### CORS & Security
- `CORS_ORIGIN`: `https://danmaku.cloud`
- `CORS_CREDENTIALS`: `true`
- `COOKIE_SECURE`: `true`

### Frontend & URLs
- `FRONTEND_URL`: `https://danmaku.cloud`
- `MOBILE_CALLBACK_URL`: `danmaku://auth/callback`

### JWT & Session
- `JWT_ACCESS_EXPIRATION`: `15m`
- `JWT_REFRESH_EXPIRATION`: `7d`
- `JWT_ALGORITHM`: `HS256`
- `SESSION_TTL`: `86400`

### OAuth Configuration
- `GOOGLE_OAUTH_ENABLED`: `true`
- `GOOGLE_REDIRECT_URI`: `https://danmaku.cloud/api/auth/callback/google`
- `GOOGLE_DRIVE_REDIRECT_URI`: `https://danmaku.cloud/api/drive-connections/google/callback`
- `GOOGLE_SCOPES`: `openid email profile https://www.googleapis.com/auth/drive`
- `ONEDRIVE_OAUTH_ENABLED`: `false`
- `ONEDRIVE_REDIRECT_URI`: `https://danmaku.cloud/api/auth/callback/onedrive`
- `ONEDRIVE_SCOPES`: `openid,email,profile,Files.Read,offline_access`

### Encryption & Storage
- `ENCRYPTION_ALGORITHM`: `aes-256-gcm`
- `STORAGE_PATH`: `./uploads`
- `SCREENSHOT_MAX_SIZE`: `5242880`
- `SCREENSHOT_QUALITY`: `90`

### Rate Limiting & Features
- `RATE_LIMIT_WINDOW`: `900000`
- `RATE_LIMIT_MAX_REQUESTS`: `100`
- `ENABLE_LOCAL_AUTH`: `true`
- `ENABLE_OAUTH_GOOGLE`: `true`
- `ENABLE_OAUTH_ONEDRIVE`: `false`
- `ENABLE_SCREENSHOTS`: `true`
- `ENABLE_PLAYLISTS`: `true`
- `ENABLE_COMMENTS`: `true`

---

## 2. AWS Secrets Manager (JSON Secrets)

### `danmaku/app-secrets`
```json
{
  "jwt_secret": "...",           // → JWT_SECRET
  "session_secret": "...",       // → SESSION_SECRET
  "encryption_key": "...",       // → ENCRYPTION_KEY
  "encryption_algorithm": "aes-256-gcm"
}
```

### `danmaku/oauth-secrets`
```json
{
  "google_client_id": "...",           // → GOOGLE_CLIENT_ID
  "google_client_secret": "...",       // → GOOGLE_CLIENT_SECRET
  "onedrive_client_id": "",            // → ONEDRIVE_CLIENT_ID
  "onedrive_client_secret": ""         // → ONEDRIVE_CLIENT_SECRET
}
```

### `danmaku/db-credentials`
```json
{
  "host": "...",           // → DB_HOST, TYPEORM_HOST
  "port": 5432,            // → DB_PORT, TYPEORM_PORT
  "username": "...",       // → DB_USERNAME, TYPEORM_USERNAME
  "password": "...",       // → DB_PASSWORD, TYPEORM_PASSWORD
  "dbname": "..."          // → DB_NAME, TYPEORM_DATABASE
}
```
さらに `DATABASE_URL=postgresql://user:pass@host:port/db` を生成

### `danmaku/redis-credentials`
```json
{
  "host": "...",           // → REDIS_HOST
  "port": 6379,            // → REDIS_PORT
  "password": "...",       // → REDIS_PASSWORD
  "db": 0                  // → REDIS_DB
}
```

---

## 3. バリデーション規則

environment.schema.ts での自動検証：

**必須**:
- `JWT_SECRET`: 最小 32 文字
- `SESSION_SECRET`: 最小 32 文字
- `ENCRYPTION_KEY`: 最小 64 文字
- `DATABASE_URL`: 有効な URL

**条件付き**:
- `GOOGLE_OAUTH_ENABLED=true` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` 必須

---

## 4. デプロイチェックリスト

- [ ] prod.tfvars の全環境変数が設定済み
- [ ] 4 つの Secrets Manager が存在
- [ ] ECS Task Definition が secrets 参照設定済み
- [ ] IAM Role に secretsmanager:GetSecretValue 権限あり
- [ ] CloudWatch Logs で `✅ Environment validation passed` を確認
