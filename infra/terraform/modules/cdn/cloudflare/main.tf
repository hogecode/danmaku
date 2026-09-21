# ========================================
# Cloudflare - CDN & Security Configuration
# ========================================
#
# This module manages Cloudflare DNS, SSL/TLS, caching, and security settings
# for the danmaku.cloud domain using the Cloudflare Terraform Provider.

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

data "cloudflare_zone" "main" {
  name = var.domain_name
}

# ========================================
# DNS Records
# ========================================

resource "cloudflare_record" "alb_cname" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.subdomain_prefix != "" ? var.subdomain_prefix : "@"
  type    = "CNAME"
  value   = var.alb_dns_name
  ttl     = 1
  proxied = true

  comment = "ALB endpoint for ${var.environment} environment"
}

resource "cloudflare_record" "www" {
  zone_id = data.cloudflare_zone.main.id
  name    = "www"
  type    = "CNAME"
  value   = var.subdomain_prefix != "" ? cloudflare_record.alb_cname.fqdn : var.domain_name
  ttl     = 1
  proxied = true

  comment = "WWW subdomain"
}


# ========================================
# Zone Settings - SSL/TLS & Security
# ========================================

resource "cloudflare_zone_settings_override" "main" {
  zone_id = data.cloudflare_zone.main.id

  settings {
    # SSL/TLS
    ssl                      = var.ssl_mode // flexible, full, full_strict
    min_tls_version          = var.min_tls_version // "1.0", "1.1", "1.2", "1.3"
    tls_1_3                  = "on"
    automatic_https_rewrites = "on"
    always_use_https         = "on"

    # Security
    security_level = var.security_level // essentially_off, low, medium, high, under_attack

    # Caching
    cache_level       = var.cache_level
    browser_cache_ttl = var.browser_cache_ttl
    always_online     = var.environment == "prod" ? "on" : "off"

    # Performance
    minify {
      css  = var.enable_minify
      html = var.enable_minify
      js   = var.enable_minify
    }

    rocket_loader      = var.enable_rocket_loader ? "on" : "off"
    brotli             = "on" // brotli compression
    email_obfuscation  = "on" //メールアドレスの難読化
    hotlink_protection = var.enable_hotlink_protection ? "on" : "off"
    development_mode   = var.development_mode ? "on" : "off"
  }

  depends_on = [data.cloudflare_zone.main]
}

# ========================================
# ========================================
# Cache Rules - Caching Strategy
# ========================================

# Cache rules provide more granular control than page rules
# These rules control how content is cached based on request criteria

# Cache static assets for extended period
resource "cloudflare_cache_rule" "cache_assets" {
  count   = var.enable_cache_rules ? 1 : 0
  zone_id = data.cloudflare_zone.main.id

  description = "Cache static assets for 7 days"

  actions {
    cache {
      default_ttl = 604800
    }
  }

  expression = "(cf.uri.path matches \"^/static/\")"
}

# Bypass cache for API endpoints
resource "cloudflare_cache_rule" "no_cache_api" {
  count   = var.enable_cache_rules ? 1 : 0
  zone_id = data.cloudflare_zone.main.id

  description = "Bypass cache for API endpoints"

  actions {
    cache {
      default_ttl = 0
    }
  }

  expression = "(cf.uri.path matches \"^/api/\")"
}

# ========================================
# Rate Limiting (via Firewall Rules)
# ========================================

# Note: In Cloudflare Provider v4, rate limiting is configured via 
# the Cloudflare UI or advanced API configurations.
# Basic rate limiting can be configured through zone settings.

# For advanced API rate limiting, configure via Cloudflare dashboard:
# 1. Go to Security > WAF > Rate Limiting Rules
# 2. Create rule for /api/* paths
# 3. Set threshold and action

# Alternatively, use count to enable/disable rate limiting setup later
locals {
  enable_api_rate_limit = var.enable_rate_limiting && var.environment != "dev"
}

# Future implementation note:
# When Cloudflare releases updated rate limiting resources in Terraform,
# this section can be enhanced with dynamic rules.
