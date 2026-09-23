# ========================================
# Cloudflare - CDN & Security Configuration
# ========================================
#
# This module manages Cloudflare DNS, SSL/TLS, caching, security settings,
# Web Analytics, WAF rules, DDoS protection, and Workers routes
# for the danmaku.cloud domain using the Cloudflare Terraform Provider.

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.4"
    }
  }
}

# ========================================
# Data: Cloudflare Zone Lookup
# ========================================

data "cloudflare_zone" "main" {
  name = var.domain_name
}

locals {
  zone_id = try(data.cloudflare_zone.main.id, "")
}

# ========================================
# DNS Records - ALB & WWW
# ========================================

resource "cloudflare_record" "alb_cname" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = data.cloudflare_zone.main.id
  name    = var.subdomain_prefix != "" ? var.subdomain_prefix : "@"
  type    = "CNAME"
  content = var.alb_dns_name
  ttl     = 1
  proxied = true
  comment = "ALB endpoint for ${var.environment} environment"
}

resource "cloudflare_record" "www" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = data.cloudflare_zone.main.id
  name    = "www"
  type    = "CNAME"
  content = cloudflare_record.alb_cname[0].content
  ttl     = 1
  proxied = true
  comment = "WWW subdomain pointing to ALB"
  depends_on = [cloudflare_record.alb_cname]
}

# ========================================
# Zone Settings - SSL/TLS & Security
# ========================================

resource "cloudflare_zone_settings_override" "main" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = data.cloudflare_zone.main.id

  settings {
    ssl                      = var.ssl_mode
    min_tls_version          = var.min_tls_version
    security_level           = var.security_level
    cache_level              = var.cache_level
    browser_cache_ttl        = var.browser_cache_ttl
    bot_fight_mode           = var.enable_bot_fight_mode ? "on" : "off"
    automatic_https_rewrites = "on"
    always_use_https         = "on"
    hotlink_protection       = var.enable_hotlink_protection ? "on" : "off"
    rocket_loader            = var.enable_rocket_loader ? "on" : "off"
    http2                    = "on"
    http3                    = "on"
    mirage                   = "on"
    opportunistic_onion      = "on"

    minify {
      css  = var.enable_minify ? "on" : "off"
      html = var.enable_minify ? "on" : "off"
      js   = var.enable_minify ? "on" : "off"
    }
  }

  depends_on = [data.cloudflare_zone.main]
}



# ========================================
# Cache Rules - Firewall Filters
# ========================================

resource "cloudflare_firewall_filter" "cache_static" {
  count       = var.domain_name != "" && var.enable_cache_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Cache static files"
  expression  = "(http.request.uri.path matches \"\\.(js|css|jpg|png|gif|ico|woff|woff2|svg|font)$\")"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "cache_nextjs" {
  count       = var.domain_name != "" && var.enable_cache_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Cache Next.js static files"
  expression  = "http.request.uri.path matches \"^/_next/\""
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "bypass_api" {
  count       = var.domain_name != "" && var.enable_cache_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Bypass cache for API"
  expression  = "(http.request.uri.path matches \"^/api/\") or (http.request.method eq \"POST\") or (http.request.method eq \"PUT\") or (http.request.method eq \"DELETE\")"
  depends_on  = [data.cloudflare_zone.main]
}

# ========================================
# Rate Limiting - Firewall Rules
# ========================================

resource "cloudflare_firewall_filter" "rate_limit_api_filter" {
  count       = var.domain_name != "" && var.enable_rate_limiting ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "API endpoint rate limit filter"
  expression  = "http.request.uri.path matches \"^/api/.*\""
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "rate_limit_api" {
  count       = var.domain_name != "" && var.enable_rate_limiting ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Rate limit API endpoints"
  filter_id   = cloudflare_firewall_filter.rate_limit_api_filter[0].id
  action      = "challenge"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "rate_limit_auth_filter" {
  count       = var.domain_name != "" && var.enable_rate_limiting ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Auth endpoint rate limit filter"
  expression  = "(http.request.uri.path matches \"^/auth/.*\") or (http.request.uri.path contains \"/login\") or (http.request.uri.path contains \"/register\")"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "rate_limit_auth" {
  count       = var.domain_name != "" && var.enable_rate_limiting ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Rate limit auth endpoints"
  filter_id   = cloudflare_firewall_filter.rate_limit_auth_filter[0].id
  action      = "block"
  depends_on  = [data.cloudflare_zone.main]
}


# ========================================
# WAF Rules - Firewall Rules
# ========================================

resource "cloudflare_firewall_filter" "waf_sql_injection_filter" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "SQL Injection WAF rule"
  expression  = "(http.request.uri contains \"union\") or (http.request.uri contains \"select\") or (http.request.uri contains \"drop\") or (http.request.body contains \"union\") or (http.request.body contains \"select\")"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "waf_sql_injection" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Block SQL injection attempts"
  filter_id   = cloudflare_firewall_filter.waf_sql_injection_filter[0].id
  action      = "block"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "waf_xss_filter" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "XSS WAF rule"
  expression  = "(http.request.uri contains \"<script\") or (http.request.uri contains \"javascript:\") or (http.request.body contains \"<script\") or (http.request.body contains \"javascript:\")"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "waf_xss" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Block XSS attempts"
  filter_id   = cloudflare_firewall_filter.waf_xss_filter[0].id
  action      = "block"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "waf_lfi_filter" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "LFI WAF rule"
  expression  = "http.request.uri contains \"../\" or http.request.uri contains \"%2e%2e/\" or http.request.uri contains \"/etc/passwd\""
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "waf_lfi" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Block LFI attempts"
  filter_id   = cloudflare_firewall_filter.waf_lfi_filter[0].id
  action      = "block"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "waf_rce_filter" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "RCE WAF rule"
  expression  = "http.request.uri contains \"exec\" or http.request.uri contains \"system\" or http.request.uri contains \"shell_exec\" or http.request.body contains \"exec\" or http.request.body contains \"system\""
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "waf_rce" {
  count       = var.domain_name != "" && var.enable_waf_rules ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Block RCE attempts"
  filter_id   = cloudflare_firewall_filter.waf_rce_filter[0].id
  action      = "block"
  depends_on  = [data.cloudflare_zone.main]
}




# ========================================
# DDoS & Malicious Traffic Protection
# ========================================

resource "cloudflare_firewall_filter" "ddos_protection" {
  count       = var.domain_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Generic DDoS pattern detection"
  expression  = "(http.response.code eq 403) or (cf.client_port eq 0)"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "ddos_protection_generic" {
  count       = var.domain_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "DDoS protection - block suspicious patterns"
  filter_id   = cloudflare_firewall_filter.ddos_protection[0].id
  action      = "challenge"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "malicious_actors" {
  count       = var.domain_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Known malicious actors"
  expression  = "(cf.threat_score gt 50)"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "block_malicious" {
  count       = var.domain_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Block known malicious actors"
  filter_id   = cloudflare_firewall_filter.malicious_actors[0].id
  action      = "block"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_filter" "suspicious_traffic" {
  count       = var.domain_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Suspicious traffic pattern detection"
  expression  = "(http.user_agent contains \"bot\") or (http.user_agent contains \"crawler\") or (http.user_agent eq \"\")"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_firewall_rule" "challenge_suspicious" {
  count       = var.domain_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  description = "Challenge suspicious traffic patterns"
  filter_id   = cloudflare_firewall_filter.suspicious_traffic[0].id
  action      = "challenge"
  depends_on  = [data.cloudflare_zone.main]
}


# ========================================
# Logpush - Log Streaming to S3
# ========================================

resource "cloudflare_logpush_job" "http_requests" {
  count            = var.enable_logpush && var.s3_logpush_bucket != "" ? 1 : 0
  account_id       = var.cloudflare_account_id
  enabled          = true
  name             = "Cloudflare HTTP Request Logs - ${var.environment}"
  destination_conf = "s3://${var.s3_logpush_bucket}/danmaku-${var.environment}/http_requests,roll_interval=3600,encryption=sse-kms"
  dataset          = "http_requests"
  frequency        = "low"
  logpull_options  = "timestamps=rfc3339&fields=RayID,ClientIP,EdgeStartTimestamp,EdgeEndTimestamp,Status,CacheCacheStatus,CacheResponseStatus,ContentType,Host,URI,RequestMethod,RequestProtocol,HTTPProtocol,ResponseContentLength,Country"
}

resource "cloudflare_logpush_job" "firewall_events" {
  count            = var.enable_logpush && var.s3_logpush_bucket != "" ? 1 : 0
  account_id       = var.cloudflare_account_id
  enabled          = true
  name             = "Cloudflare Firewall Events - ${var.environment}"
  destination_conf = "s3://${var.s3_logpush_bucket}/danmaku-${var.environment}/firewall_events,roll_interval=3600,encryption=sse-kms"
  dataset          = "firewall_events"
  frequency        = "low"
  logpull_options  = "timestamps=rfc3339&fields=RayID,ClientIP,Datetime,Action,Source,UserAgent,Country,Disposition,RuleID,EdgeResponseStatus"
}

resource "cloudflare_logpush_job" "bot_management" {
  count            = var.enable_logpush && var.s3_logpush_bucket != "" && var.enable_bot_fight_mode ? 1 : 0
  account_id       = var.cloudflare_account_id
  enabled          = true
  name             = "Cloudflare Bot Management - ${var.environment}"
  destination_conf = "s3://${var.s3_logpush_bucket}/danmaku-${var.environment}/bot_management,roll_interval=3600,encryption=sse-kms"
  dataset          = "bot_management"
  frequency        = "low"
  logpull_options  = "timestamps=rfc3339&fields=RayID,Datetime,ClientIP,Score,Source,Action,Country"
}

resource "cloudflare_logpush_job" "access_logs" {
  count            = var.enable_logpush && var.s3_logpush_bucket != "" ? 1 : 0
  account_id       = var.cloudflare_account_id
  enabled          = true
  name             = "Cloudflare Access Logs - ${var.environment}"
  destination_conf = "s3://${var.s3_logpush_bucket}/danmaku-${var.environment}/access_logs,roll_interval=3600,encryption=sse-kms"
  dataset          = "access_requests"
  frequency        = "low"
  logpull_options  = "timestamps=rfc3339&fields=RayID,ClientIP,Datetime,Action,UserID,Country,IP,HttpStatus,HTTPProtocol"
}



# ========================================
# Custom SSL/mTLS Configuration
# ========================================

resource "cloudflare_custom_ssl" "main" {
  count       = var.domain_name != "" && var.enable_custom_ssl && var.custom_ssl_certificate != "" && var.custom_ssl_key != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  certificate = var.custom_ssl_certificate
  private_key = var.custom_ssl_key
  bundle_method = "ubiquitous"
  depends_on  = [data.cloudflare_zone.main]
}

# ========================================
# Cloudflare Workers Routes
# ========================================

resource "cloudflare_worker_route" "api" {
  count       = var.domain_name != "" && var.enable_workers_routes && var.worker_script_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.domain_name}/api/v1/*"
  script_name = var.worker_script_name
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_worker_route" "images" {
  count       = var.domain_name != "" && var.enable_workers_routes && var.enable_image_optimization ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.domain_name}/images/*"
  script_name = "image-optimization-worker"
  depends_on  = [data.cloudflare_zone.main]
}

resource "cloudflare_worker_route" "static" {
  count       = var.domain_name != "" && var.enable_workers_routes && var.worker_script_name != "" ? 1 : 0
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.domain_name}/static/*"
  script_name = var.worker_script_name
  depends_on  = [data.cloudflare_zone.main]
}

