# ========================================
# Cloudflare Module Outputs
# ========================================

output "zone_id" {
  description = "Cloudflare Zone ID"
  value       = data.cloudflare_zone.main.id
}

output "zone_status" {
  description = "Cloudflare Zone status"
  value       = data.cloudflare_zone.main.status
}

output "nameservers" {
  description = "Cloudflare nameservers (to be configured at domain registrar)"
  value       = data.cloudflare_zone.main.name_servers
}

output "alb_cname_record" {
  description = "ALB CNAME record details"
  value = var.domain_name != "" ? {
    name = cloudflare_record.alb_cname[0].name
    ttl  = cloudflare_record.alb_cname[0].ttl
  } : null
}

output "www_cname_record" {
  description = "WWW CNAME record details"
  value = var.domain_name != "" ? {
    name = cloudflare_record.www[0].name
  } : null
}

output "ssl_configuration" {
  description = "SSL/TLS configuration"
  value = var.domain_name != "" ? {
    mode            = var.ssl_mode
    min_tls_version = var.min_tls_version
  } : null
}

output "security_configuration" {
  description = "Security configuration"
  value = var.domain_name != "" ? {
    security_level = var.security_level
    bot_fight_mode = var.enable_bot_fight_mode
  } : null
}

output "caching_configuration" {
  description = "Caching configuration"
  value = var.domain_name != "" ? {
    cache_level       = var.cache_level
    browser_cache_ttl = var.browser_cache_ttl
  } : null
}

output "performance_configuration" {
  description = "Performance configuration"
  value = var.domain_name != "" ? {
    minify = var.enable_minify
  } : null
}

output "rate_limiting_configuration" {
  description = "Rate limiting configuration"
  value = {
    enable_rate_limiting = var.enable_rate_limiting
    note                 = "Configure rate limiting via Cloudflare Dashboard (Rulesets require Enterprise plan)"
  }
}

output "logpush_jobs" {
  description = "Logpush job IDs for log streaming to S3"
  value = {
    enabled = false # Logpush configured via Cloudflare dashboard
  }
}

output "waf_configuration" {
  description = "WAF rules configuration"
  value = {
    enable_waf_rules = var.enable_waf_rules
    note             = "Configure WAF via Cloudflare Dashboard (Advanced expressions require Enterprise plan)"
  }
}

output "ddos_protection_configuration" {
  description = "DDoS protection configuration"
  value = {
    environment             = var.environment
    ddos_protection_enabled = var.environment == "prod" ? true : false
    note                    = "Configure DDoS protection and advanced settings via Cloudflare Dashboard"
  }
}

output "workers_routes" {
  description = "Cloudflare Workers routes configuration"
  value = {
    enable_workers_routes     = var.enable_workers_routes
    enable_image_optimization = var.enable_image_optimization
    worker_script_name        = var.worker_script_name
    note                      = "Configure workers routes via Cloudflare dashboard"
  }
}

output "custom_ssl_configuration" {
  description = "Custom SSL/mTLS configuration"
  value = {
    enable_custom_ssl = var.enable_custom_ssl
    enable_mtls       = var.enable_mtls
    note              = "Configure custom SSL and mTLS via Cloudflare dashboard"
  }
}

output "web_analytics_enabled" {
  description = "Web Analytics status"
  value = {
    enabled     = var.web_analytics_token != ""
    environment = var.environment
  }
}

output "cache_rules" {
  description = "Cache rules configuration"
  value = {
    enable_cache_rules = var.enable_cache_rules
    note               = "Configure cache rules via Cloudflare dashboard or Page Rules"
  }
}
