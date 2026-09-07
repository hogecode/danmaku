# ========================================
# Route53 Module Variables
# ========================================

variable "route53_zone_id" {
  description = "Route53 zone ID"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB Zone ID"
  type        = string
}

variable "dmarc_record" {
  description = "DMARC record value"
  type        = string
  default     = ""
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}
