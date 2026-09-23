# Cloudflare CDN & Security Module

Complete Cloudflare infrastructure management with advanced features for DNS, SSL/TLS, caching, security, analytics, and DDoS protection.

## Overview

Cloudflareモジュールの主な機能：

### Core Features
- ✅ **DNS管理**: ALBへのCNAMEレコード設定（修正済み）
- ✅ **SSL/TLS**: Full Strictモード、自動HTTPS リダイレクト
- ✅ **Advanced キャッシング**: キャッシュルール、Next.js assets最適化
- ✅ **Rate Limiting**: API・認証エンドポイント制限（新規実装）
- ✅ **Bot Management**: Bot Fight Mode実装（新規実装）
- ✅ **Web Analytics**: Cloudflare Analytics統合（新規実装）

### Security Features (New)
- ✅ **WAF Rules**: OWASP Core Rule Set、SQL Injection対策
- ✅ **DDoS Protection**: Advanced DDoS mitigation（本番環境）
- ✅ **Custom SSL/mTLS**: 自社証明書、相互TLS認証対応

### Performance & Logging (New)
- ✅ **Logpush**: HTTPリクエスト、ファイアウォール、Bot検出ログをS3へ
- ✅ **Cloudflare Workers**: ルート設定、画像最適化
- ✅ **HTTP/2, HTTP/3**: モダンプロトコル対応
- ✅ **Early Hints**: ページロード最適化

## ネットワーク構成

```
[User] → [Cloudflare] → [ALB] → [ECS Services]
```

1. **Cloudflare Zone**: danmaku.cloud ドメインを管理
2. **DNS Records**: 
   - `danmaku.cloud` → ALB CNAME（Cloudflareプロキシ経由）
   - `www.danmaku.cloud` → ALB CNAME

3. **セキュリティ設定**: SSL/TLS、WAF、レート制限
4. **パフォーマンス最適化**: キャッシング、minify、圧縮

## 必要な準備

### 1. Cloudflareアカウント設定

```bash
# Cloudflareの管理画面から API Token を取得
# 必要な権限:
# - Zone.Zone (read)
# - Zone.DNS (edit)
# - Cache Purge (purge)
# - Zone Settings (edit)
```

### 2. Zone IDの確認

```bash
# Zone IDはドメイン設定ページの右下に表示されます
# または API で取得:
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=danmaku.cloud" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

## 使用方法

### 基本設定

```hcl
module "cloudflare" {
  source = "./modules/cdn/cloudflare"

  domain_name              = "danmaku.cloud"
  environment              = "prod"
  alb_dns_name             = module.alb.public_alb_dns_name
  
  # SSL/TLS
  ssl_mode        = "full"
  min_tls_version = "1.2"
  
  # Security
  security_level        = "high"
  enable_bot_fight_mode = true
  
  # Caching
  cache_level       = "aggressive"
  browser_cache_ttl = 3600
  
  # Performance
  enable_minify        = true
  enable_rocket_loader = true
  
  # Rate Limiting
  enable_rate_limiting     = true
  api_rate_limit_threshold = 1000
  api_rate_limit_period    = 3600
}
```

### 環境別設定

**Dev環境**:
```hcl
ssl_mode                 = "full"
security_level           = "medium"
enable_cloudflare_minify = false
enable_cloudflare_rate_limiting = false
```

**Prod環境**:
```hcl
ssl_mode                 = "full"
security_level           = "high"
enable_cloudflare_minify = true
enable_cloudflare_rate_limiting = true
enable_hotlink_protection = true
development_mode        = false
```

## API Token の設定

### 方法1: 環境変数

```bash
export TF_VAR_cloudflare_api_token="YOUR_API_TOKEN"
terraform plan -var-file="prod.tfvars"
```

### 方法2: GitHub Actions Secret

```yaml
env:
  TF_VAR_cloudflare_api_token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 方法3: .tfvars ファイル（⚠️ Git Ignore必須）

```hcl
cloudflare_api_token = "YOUR_API_TOKEN"
```

**.gitignore に以下を追加**:
```
*.tfvars
!example.tfvars
.terraform/
terraform.tfstate*
```

## DNS設定の確認

Cloudflareに設定後、DNSレコードを確認：

```bash
# 設定されたCNAMEを確認
nslookup danmaku.cloud

# またはdig コマンド
dig danmaku.cloud CNAME
```

出力例:
```
danmaku.cloud. 1800 IN CNAME <alb-dns-name>.elb.ap-northeast-1.amazonaws.com.
```

## SSL/TLS設定の検証

```bash
# 1. HTTPS接続確認
curl -I https://danmaku.cloud

# 2. TLSバージョン確認
openssl s_client -connect danmaku.cloud:443 -tls1_2

# 3. 証明書情報確認
openssl s_client -connect danmaku.cloud:443 </dev/null | openssl x509 -text
```

## キャッシング設定

### Page Rules

| Path | Cache Level | TTL |
|------|------------|-----|
| `/static/*` | cache_everything | 7days |
| `/public/*` | cache_everything | 1day |
| `/api/*` | bypass | - |

### ブラウザキャッシュ

- **デフォルト**: 1800秒（30分）
- **本番**: 3600秒（1時間）
- **開発**: 300秒（5分）

## WAF/セキュリティ設定

### 有効な機能

- **Bot Fight Mode**: 疑わしいボットをチャレンジ
- **Security Level**: 環境別に自動調整
- **Rate Limiting**: API・認証エンドポイント

### Rate Limiting ルール

**API エンドポイント**:
- **閾値**: 1000リクエスト
- **期間**: 3600秒（1時間）
- **動作**: 429（Too Many Requests）を返す

## トラブルシューティング

### DNS が反映されない

```bash
# Cloudflare nameserver を確認
nslookup -type=NS danmaku.cloud

# ドメインレジストラで nameserver を更新したか確認
# 通常 48-72時間で反映
```

### HTTPS接続エラー

```
# SSL Mode を確認
# ALB が HTTPS をサポートしているか確認
# ACM証明書が有効か確認

# ローカルテスト
curl -v https://danmaku.cloud
```

### キャッシュが効かない

```
# Page Rules の優先度を確認
# Cache-Control ヘッダーを確認
curl -I https://danmaku.cloud/static/file.js

# 開発モードが有効になっていないか確認
# development_mode = true の場合、キャッシュを無視
```

### レート制限が動作しない

- `enable_rate_limiting = true` か確認
- 本番環境のみ有効
- API エンドポイント `/api/*` のみ対象

## 監視とメトリクス

### Cloudflareダッシュボード

1. Analytics タブ：トラフィック、キャッシュ率、レイテンシ
2. Security：WAFイベント、ボット検出
3. Caching：キャッシュ率、TTL
4. Performance：Core Web Vitals

### CloudWatch との連携

将来的に Logpush を有効化して、S3へのログ記録を実装可能。

## Variables

| Name | Type | Default | 説明 |
|------|------|---------|------|
| `domain_name` | string | - | ドメイン名 |
| `environment` | string | - | 環境(dev/staging/prod) |
| `alb_dns_name` | string | - | ALB DNS名 |
| `ssl_mode` | string | "full" | SSL/TLSモード |
| `security_level` | string | "high" | セキュリティレベル |
| `cache_level` | string | "simplified" | キャッシュレベル |
| `enable_rate_limiting` | bool | true | レート制限を有効化 |
| `enable_minify` | bool | true | auto minifyを有効化 |

## Outputs

```hcl
cloudflare_zone_id       # Zone ID
cloudflare_nameservers   # nameservers (for domain registrar)
cloudflare_dns_records   # DNS CNAME レコード
cloudflare_configuration # SSL, Security, Caching設定
```

## Version Update - Cloudflare Provider v5 Compatibility

### v5 Compatibility Updates (v5.0+ 対応)
- ✅ **Provider Version**: `~> 5.0` に更新
- ✅ **WAF Rules**: `cloudflare_waf_rule` (legacy) → `cloudflare_firewall_filter` + `cloudflare_firewall_rule` に変更
- ✅ **Rate Limiting**: `cloudflare_rate_limit` (deprecated) → `cloudflare_firewall_filter` + `cloudflare_firewall_rule` に変更
- ✅ **mTLS**: `cloudflare_client_certificate_hosted_certificate` → `cloudflare_certificate_pack` に変更
- ✅ **mtls_csr_pem Variable**: 削除（v5では不要）

## Recent Updates (改善履歴)

### Fixed Issues (修正内容)
- ✅ **WWW レコード ロジック**: 単純化。常にALBへ指す
- ✅ **Bot Fight Mode**: Zone Settings に統合実装
- ✅ **日本語コメント**: 英語に統一
- ✅ **depends_on**: 一貫性確保

### New Implementations (新規機能)
- ✅ **Rate Limiting**: API（1000req/h）と認証（100req/h）エンドポイント分離
- ✅ **Logpush**: HTTP リクエスト、ファイアウォール、Bot検出ログ
- ✅ **Cache Rules**: Next.js (/_next/) パス追加
- ✅ **WAF Rules**: OWASP CRS + SQL Injection
- ✅ **DDoS Protection**: HTTP/2, HTTP/3, Early Hints
- ✅ **Cloudflare Workers**: ルート管理、画像最適化
- ✅ **Custom SSL/mTLS**: 自社証明書対応
- ✅ **Web Analytics**: Token 統合

### Variable Additions (新規変数)
- `auth_rate_limit_threshold`, `auth_rate_limit_period`
- `web_analytics_token`
- `enable_waf_rules`, `enable_workers_routes`
- `enable_custom_ssl`, `enable_mtls`
- その他多数

## 参考リンク

- [Cloudflare Terraform Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Zone Setup Guide](https://developers.cloudflare.com/dns/setup/)
- [SSL/TLS Configuration](https://developers.cloudflare.com/ssl/edge-certificates/)
- [WAF Rules](https://developers.cloudflare.com/waf/rules/)
- [Logpush](https://developers.cloudflare.com/logs/logpush/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
