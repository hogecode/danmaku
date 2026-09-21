# Secrets Manager Module Variables
# 
# This module creates and references secrets in AWS Secrets Manager
# - Redis credentials: auto-generated with ElastiCache endpoint
# - App secrets: referenced from existing secret (or auto-created if create_app_secrets=true)
# - OAuth secrets: referenced from existing secret (or auto-created if create_oauth_secrets=true)

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint address"
  type        = string
  default     = ""
}

variable "redis_port" {
  description = "ElastiCache Redis port"
  type        = number
  default     = 6379
}

variable "create_app_secrets" {
  description = "Whether to create app/secrets automatically (true) or reference existing (false)"
  type        = bool
  default     = false
}

variable "create_oauth_secrets" {
  description = "Whether to create oauth/secrets automatically (true) or reference existing (false)"
  type        = bool
  default     = false
}

variable "app_secrets_data" {
  description = "Application secrets data (only used if create_app_secrets is true)"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "oauth_secrets_data" {
  description = "OAuth secrets data (only used if create_oauth_secrets is true)"
  type        = map(string)
  default     = {}
  sensitive   = true
}
