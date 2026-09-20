# Secrets Manager Module Variables
# 
# This module only references existing secrets in AWS Secrets Manager
# Secrets are created and managed externally (via AWS CLI, Console, or CI/CD)

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
