# Secrets Manager Module Variables
# 
# This module creates and references secrets in AWS Secrets Manager
# - Redis credentials: auto-generated with ElastiCache endpoint
# - App secrets: referenced from existing secret
# - OAuth secrets: referenced from existing secret

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
