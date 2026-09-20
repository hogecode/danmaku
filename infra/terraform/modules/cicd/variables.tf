# ========================================
# CI/CD Module Variables
# ========================================

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment (dev, prod, etc.)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}

# ========================================
# GitHub OIDC Configuration
# ========================================

variable "github_oidc_subject_claim" {
  description = "GitHub OIDC subject claim (e.g., 'repo:owner/repo:*')"
  type        = string
  default     = "repo:*/*:*"
}

# ========================================
# ECR Configuration
# ========================================

variable "ecr_nextjs_repository_name" {
  description = "ECR repository name for Next.js"
  type        = string
}

variable "ecr_nestjs_repository_name" {
  description = "ECR repository name for NestJS"
  type        = string
}

# ========================================
# Data Source
# ========================================

data "aws_caller_identity" "current" {}
