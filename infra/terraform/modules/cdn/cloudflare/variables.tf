# ========================================
# Cloudflare Module Variables
# ========================================

variable "domain_name" {
  description = "Domain name (e.g., danmaku.cloud)"
  type        = string
}

variable "subdomain_prefix" {
  description = "Subdomain prefix (empty for root domain)"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}

variable "alb_dns_name" {
  description = "ALB DNS name from AWS ALB module"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID for Logpush"
  type        = string
  default     = ""
}

# ========================================
# SSL/TLS Configuration
# ========================================

variable "ssl_mode" {
  description = "SSL/TLS mode (flexible, full, full_strict)"
  type        = string
  default     = "full"

  validation {
    condition     = contains(["flexible", "full", "full_strict"], var.ssl_mode)
    error_message = "SSL mode must be flexible, full, or full_strict"
  }
}

variable "min_tls_version" {
  description = "Minimum TLS version"
  type        = string
  default     = "1.2"

  validation {
    condition     = contains(["1.0", "1.1", "1.2", "1.3"], var.min_tls_version)
    error_message = "TLS version must be 1.0, 1.1, 1.2, or 1.3"
  }
}

# ========================================
# Security Configuration
# ========================================

variable "security_level" {
  description = "Security level (essentially_off, low, medium, high, under_attack)"
  type        = string
  default     = "high"

  validation {
    condition     = contains(["essentially_off", "low", "medium", "high", "under_attack"], var.security_level)
    error_message = "Invalid security level"
  }
}

variable "enable_bot_fight_mode" {
  description = "Enable bot fight mode"
  type        = bool
  default     = true
}

# ========================================
# Caching Configuration
# ========================================

variable "cache_level" {
  description = "Cache level (bypass, basic, simplified, aggressive, cache_everything)"
  type        = string
  default     = "simplified"

  validation {
    condition     = contains(["bypass", "basic", "simplified", "aggressive", "cache_everything"], var.cache_level)
    error_message = "Invalid cache level"
  }
}

variable "browser_cache_ttl" {
  description = "Browser cache TTL in seconds"
  type        = number
  default     = 1800

  validation {
    condition     = var.browser_cache_ttl >= 0
    error_message = "Browser cache TTL must be >= 0"
  }
}

# ========================================
# Performance Configuration
# ========================================

variable "enable_minify" {
  description = "Enable automatic minification of CSS/JS/HTML"
  type        = bool
  default     = true
}

variable "enable_rocket_loader" {
  description = "Enable Rocket Loader (JS optimization)"
  type        = bool
  default     = true
}

variable "enable_hotlink_protection" {
  description = "Enable hotlink protection"
  type        = bool
  default     = false
}

variable "development_mode" {
  description = "Enable development mode (bypasses cache)"
  type        = bool
  default     = false
}

# ========================================
# Rate Limiting
# ========================================

variable "enable_rate_limiting" {
  description = "Enable rate limiting rules"
  type        = bool
  default     = true
}

variable "api_rate_limit_threshold" {
  description = "API rate limit threshold (requests)"
  type        = number
  default     = 1000

  validation {
    condition     = var.api_rate_limit_threshold > 0
    error_message = "Rate limit threshold must be > 0"
  }
}

variable "api_rate_limit_period" {
  description = "API rate limit period in seconds"
  type        = number
  default     = 3600

  validation {
    condition     = var.api_rate_limit_period > 0
    error_message = "Rate limit period must be > 0"
  }
}

# ========================================
# Logging
# ========================================

variable "enable_logpush" {
  description = "Enable Logpush to S3"
  type        = bool
  default     = false
}

variable "s3_logpush_bucket" {
  description = "S3 bucket for Cloudflare logs"
  type        = string
  default     = ""
}

# ========================================
# Custom Hostname
# ========================================

variable "enable_custom_hostname" {
  description = "Enable custom hostname with mTLS"
  type        = bool
  default     = false
}

variable "custom_hostname_domain" {
  description = "Custom hostname domain for mTLS"
  type        = string
  default     = ""
}

# ========================================
# Tags
# ========================================

variable "enable_cache_rules" {
  description = "Enable modern Cloudflare cache rules"
  type        = bool
  default     = true
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
