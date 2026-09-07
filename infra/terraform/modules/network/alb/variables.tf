# ALB Module Variables

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

variable "vpc_id" {
  description = "VPC ID where ALBs will be deployed"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for Public ALB"
  type        = list(string)
}

variable "private_api_subnet_ids" {
  description = "List of private API layer subnet IDs for Private ALB"
  type        = list(string)
}

variable "alb_public_security_group_id" {
  description = "Security group ID for public ALB"
  type        = string
}

variable "private_alb_security_group_id" {
  description = "Security group ID for private ALB"
  type        = string
}

# ========================================
# HTTPS Configuration
# ========================================

variable "enable_https" {
  description = "Enable HTTPS listener on public ALB. Requires alb_certificate_arn to be set."
  type        = bool
  default     = false
}

variable "alb_certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener on public ALB. Required if enable_https is true."
  type        = string
  default     = ""
}

# ========================================
# Access Logs Configuration
# ========================================

variable "enable_alb_access_logs" {
  description = "Enable access logs for public ALB. Requires alb_access_logs_bucket to be set."
  type        = bool
  default     = false
}

variable "alb_access_logs_bucket" {
  description = "S3 bucket name for ALB access logs. Required if enable_alb_access_logs is true."
  type        = string
  default     = ""
}
