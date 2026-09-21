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
  value = {
    name  = cloudflare_record.alb_cname.name
    fqdn  = cloudflare_record.alb_cname.fqdn
    value = cloudflare_record.alb_cname.value
    ttl   = cloudflare_record.alb_cname.ttl
  }
}

output "www_cname_record" {
  description = "WWW CNAME record details"
  value = {
    name  = cloudflare_record.www.name
    fqdn  = cloudflare_record.www.fqdn
    value = cloudflare_record.www.value
  }
}

output "ssl_configuration" {
  description = "SSL/TLS configuration"
  value = {
    mode            = var.ssl_mode
    min_tls_version = var.min_tls_version
    always_https    = cloudflare_zone_settings_override.main.settings[0].always_use_https
  }
}

output "security_configuration" {
  description = "Security configuration"
  value = {
    security_level     = var.security_level
    bot_fight_mode     = var.enable_bot_fight_mode
    email_obfuscation  = cloudflare_zone_settings_override.main.settings[0].email_obfuscation
    hotlink_protection = cloudflare_zone_settings_override.main.settings[0].hotlink_protection
  }
}

output "caching_configuration" {
  description = "Caching configuration"
  value = {
    cache_level       = var.cache_level
    browser_cache_ttl = var.browser_cache_ttl
    always_online     = cloudflare_zone_settings_override.main.settings[0].always_online
  }
}

output "performance_configuration" {
  description = "Performance configuration"
  value = {
    minify        = var.enable_minify
    rocket_loader = var.enable_rocket_loader
    brotli        = cloudflare_zone_settings_override.main.settings[0].brotli
    gzip          = cloudflare_zone_settings_override.main.settings[0].gzip
  }
}
