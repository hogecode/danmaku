# AWS Secrets Manager Setup Guide

## Overview

本番環境では、秘密情報を以下の 4 つの Secrets Manager にまとめます：

| Secret Name | 用途 | JSON キー |
|------------|------|----------|
| `danmaku/app-secrets` | アプリケーション秘密鍵 | jwt_secret, session_secret, encryption_key |
| `danmaku/oauth-secrets` | OAuth認証情報 | google_client_id, google_client_secret |
| `danmaku/db-credentials` | PostgreSQL接続情報 | host, port, username, password, dbname |
| `danmaku/redis-credentials` | Redis接続情報 | host, port, password, db |

---

## 1️⃣ `danmaku/app-secrets` - Application Secrets

**用途**: JWT、Session、Encryption の秘密鍵

**JSON 形式**:
```json
{
  "jwt_secret": "your-super-secret-jwt-key-min-32-chars-here-change-me!",
  "session_secret": "your-super-secret-session-key-min-32-chars-change-me!",
  "encryption_key": "d148507725327068024e2b6b647df57dd5391b88e2abd4f7dd1a25e93f0c19d9",
  "encryption_algorithm": "aes-256-gcm"
}
```

**生成方法**:
```bash
# 32文字以上のランダム秘密鍵を生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2️⃣ `danmaku/oauth-secrets` - OAuth Credentials

**用途**: Google OAuth 2.0 認証情報

**JSON 形式**:
```json
{
  "google_client_id": "123456789-abcdefgh.apps.googleusercontent.com",
  "google_client_secret": "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx",
  "onedrive_client_id": "",
  "onedrive_client_secret": ""
}
```

### Google OAuth 設定手順

1. Google Cloud Console: https://console.cloud.google.com
2. **認証情報** → **OAuth クライアント ID** を作成
3. アプリケーションタイプ: **Web アプリケーション**
4. **認可済みのリダイレクト URI** に以下を登録:
   ```
   https://danmaku.cloud/api/auth/callback/google
   https://danmaku.cloud/api/drive-connections/google/callback
   ```
5. Client ID と Client Secret をコピーして Secrets Manager に格納

---

## 3️⃣ `danmaku/db-credentials` - Database Credentials

**用途**: PostgreSQL RDS 接続情報

**JSON 形式**:
```json
{
  "host": "danmaku-rds.xxxxx.ap-northeast-1.rds.amazonaws.com",
  "port": 5432,
  "username": "danmaku",
  "password": "your-strong-database-password-min-8-chars",
  "dbname": "ecsdb"
}
```

**取得方法**:
1. AWS RDS コンソールで RDS インスタンスを確認
2. Endpoint からホストを取得
3. Configuration からマスターユーザー名を取得
4. パスワードは RDS 作成時に設定した値

---

## 4️⃣ `danmaku/redis-credentials` - Redis Credentials

**用途**: ElastiCache Redis 接続情報

**JSON 形式**:
```json
{
  "host": "danmaku-redis.xxxxx.ng.0001.apne1.cache.amazonaws.com",
  "port": 6379,
  "password": "your-redis-auth-token",
  "db": 0
}
```

**取得方法**:
1. AWS ElastiCache コンソールで Redis クラスタを確認
2. Primary Endpoint からホストを取得
3. AUTH Token からパスワードを取得

---

## AWS CLI でのセットアップ

```bash
#!/bin/bash
REGION="ap-northeast-1"

# 秘密値を設定してから実行
aws secretsmanager create-secret \
  --name danmaku/app-secrets \
  --secret-string '{"jwt_secret":"...","session_secret":"...","encryption_key":"...","encryption_algorithm":"aes-256-gcm"}' \
  --region $REGION

aws secretsmanager create-secret \
  --name danmaku/oauth-secrets \
  --secret-string '{"google_client_id":"...","google_client_secret":"...","onedrive_client_id":"","onedrive_client_secret":""}' \
  --region $REGION

aws secretsmanager create-secret \
  --name danmaku/db-credentials \
  --secret-string '{"host":"...","port":5432,"username":"danmaku","password":"...","dbname":"ecsdb"}' \
  --region $REGION

aws secretsmanager create-secret \
  --name danmaku/redis-credentials \
  --secret-string '{"host":"...","port":6379,"password":"...","db":0}' \
  --region $REGION
```

---

## 環境変数マッピング表

| 秘密情報 | Secrets Manager | JSON キー | 環境変数 |
|---------|----------------|----------|---------|
| JWT秘密鍵 | danmaku/app-secrets | jwt_secret | JWT_SECRET |
| セッション秘密鍵 | danmaku/app-secrets | session_secret | SESSION_SECRET |
| 暗号化鍵 | danmaku/app-secrets | encryption_key | ENCRYPTION_KEY |
| Google Client ID | danmaku/oauth-secrets | google_client_id | GOOGLE_CLIENT_ID |
| Google Secret | danmaku/oauth-secrets | google_client_secret | GOOGLE_CLIENT_SECRET |
| DB Host | danmaku/db-credentials | host | DB_HOST |
| DB Port | danmaku/db-credentials | port | DB_PORT |
| DB Username | danmaku/db-credentials | username | DB_USERNAME |
| DB Password | danmaku/db-credentials | password | DB_PASSWORD |
| DB Name | danmaku/db-credentials | dbname | DB_NAME |
| Redis Host | danmaku/redis-credentials | host | REDIS_HOST |
| Redis Port | danmaku/redis-credentials | port | REDIS_PORT |
| Redis Password | danmaku/redis-credentials | password | REDIS_PASSWORD |
