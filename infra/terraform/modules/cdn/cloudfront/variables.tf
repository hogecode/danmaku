# ========================================
# CloudFront Module Variables
# ========================================

variable "enabled" {
  description = "Whether the distribution is enabled"
  type        = bool
  default     = true
}

variable "is_ipv6_enabled" {
  description = "Whether IPv6 is enabled"
  type        = bool
  default     = true
}

variable "default_root_object" {
  description = "Default root object"
  type        = string
  default     = "index.html"
}

variable "price_class" {
  description = "Price class"
  type        = string
  default     = "PriceClass_100"
}

variable "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  type        = string
}

variable "origin_id" {
  description = "Origin ID"
  type        = string
}

variable "origin_access_identity" {
  description = "Origin access identity"
  type        = string
  default     = ""
}

variable "allowed_methods" {
  description = "Allowed HTTP methods"
  type        = list(string)
  default     = ["GET", "HEAD"]
}

variable "cached_methods" {
  description = "Cached HTTP methods"
  type        = list(string)
  default     = ["GET", "HEAD"]
}

variable "compress" {
  description = "Enable compression"
  type        = bool
  default     = true
}

variable "query_string" {
  description = "Forward query string"
  type        = bool
  default     = false
}

variable "cookies_forward" {
  description = "Cookie forwarding"
  type        = string
  default     = "none"
}

variable "viewer_protocol_policy" {
  description = "Viewer protocol policy"
  type        = string
  default     = "redirect-to-https"
}

variable "min_ttl" {
  description = "Minimum TTL"
  type        = number
  default     = 0
}

variable "default_ttl" {
  description = "Default TTL"
  type        = number
  default     = 3600
}

variable "max_ttl" {
  description = "Maximum TTL"
  type        = number
  default     = 86400
}

variable "geo_restriction_type" {
  description = "Geo restriction type"
  type        = string
  default     = "none"
}

variable "geo_restriction_locations" {
  description = "Geo restriction locations"
  type        = list(string)
  default     = []
}

variable "use_default_certificate" {
  description = "Use default CloudFront certificate"
  type        = bool
  default     = true
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  default     = ""
}

variable "ssl_support_method" {
  description = "SSL support method"
  type        = string
  default     = "sni-only"
}

variable "minimum_protocol_version" {
  description = "Minimum protocol version"
  type        = string
  default     = "TLSv2020-10"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
