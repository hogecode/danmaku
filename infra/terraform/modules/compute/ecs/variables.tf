# ECS Module Variables

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

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for CloudMap Service Discovery"
  type        = string
}

# ========================================
# ECR Configuration
# ========================================

variable "ecr_nextjs_repository_name" {
  description = "ECR repository name for Next.js"
  type        = string
  default     = "ecs-nextjs"
}

variable "ecr_nestjs_repository_name" {
  description = "ECR repository name for Go server"
  type        = string
  default     = "ecs-nestjs"
}

variable "ecr_image_scan_on_push" {
  description = "Enable image scan on push"
  type        = bool
  default     = true
}

variable "ecr_image_tag_mutability" {
  description = "Image tag mutability"
  type        = string
  default     = "IMMUTABLE"

  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.ecr_image_tag_mutability)
    error_message = "Must be MUTABLE or IMMUTABLE"
  }
}

# ========================================
# ECS Cluster Configuration
# ========================================

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "enable_fargate_spot" {
  description = "Enable Fargate Spot instances"
  type        = bool
  default     = true
}

variable "capacity_provider_base_count" {
  description = "Base number of Fargate tasks"
  type        = number
  default     = 1
}

variable "capacity_provider_spot_weight" {
  description = "Weight for Fargate Spot in capacity provider strategy"
  type        = number
  default     = 50
}

# ========================================
# Logging Configuration
# ========================================

variable "logs_retention_days" {
  description = "CloudWatch Logs retention in days"
  type        = number
  default     = 30
}

# ========================================
# Next.js Task Definition Configuration
# ========================================

variable "nextjs_task_cpu" {
  description = "CPU units for Next.js task (256, 512, 1024, 2048, 4096)"
  type        = string
  default     = "256"
}

variable "nextjs_task_memory" {
  description = "Memory (MB) for Next.js task"
  type        = string
  default     = "512"
}

variable "nextjs_container_port" {
  description = "Container port for Next.js"
  type        = number
  default     = 3000
}

variable "nextjs_image_tag" {
  description = "ECR image tag for Next.js"
  type        = string
  default     = "latest"
}

variable "nextjs_desired_count" {
  description = "Desired number of Next.js tasks"
  type        = number
  default     = 2
}

variable "nextjs_environment_variables" {
  description = "Environment variables for Next.js container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "nextjs_secrets" {
  description = "Secrets from Secrets Manager for Next.js container"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

# ========================================
# Go Server Task Definition Configuration
# ========================================

variable "nestjs_task_cpu" {
  description = "CPU units for Go server task (256, 512, 1024, 2048, 4096)"
  type        = string
  default     = "256"
}

variable "nestjs_task_memory" {
  description = "Memory (MB) for Go server task"
  type        = string
  default     = "512"
}

variable "nestjs_container_port" {
  description = "Container port for NestJS server"
  type        = number
  default     = 3001
}

variable "nestjs_image_tag" {
  description = "ECR image tag for Go server"
  type        = string
  default     = "latest"
}

variable "nestjs_desired_count" {
  description = "Desired number of Go server tasks"
  type        = number
  default     = 2
}

variable "nestjs_environment_variables" {
  description = "Environment variables for Go server container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "nestjs_secrets" {
  description = "Secrets from Secrets Manager for Go server container"
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

# ========================================
# ECR Repository URLs
# ========================================

variable "ecr_nextjs_repository_url" {
  description = "ECR repository URL for Next.js"
  type        = string
}

variable "ecr_nestjs_repository_url" {
  description = "ECR repository URL for Go server"
  type        = string
}

# ========================================
# Network Configuration
# ========================================

variable "private_app_subnet_ids" {
  description = "List of private application subnet IDs"
  type        = list(string)
}

variable "private_api_subnet_ids" {
  description = "List of private API subnet IDs"
  type        = list(string)
}

variable "nextjs_security_group_id" {
  description = "Security group ID for Next.js ECS tasks"
  type        = string
}

variable "nestjs_security_group_id" {
  description = "Security group ID for Go Server ECS tasks"
  type        = string
}

# ========================================
# Load Balancer Configuration
# ========================================

variable "alb_dns_name" {
  description = "DNS name of the ALB (used for NEXT_PUBLIC_API_BASE_URL)"
  type        = string
  default     = ""
}

variable "nextjs_target_group_arn" {
  description = "ARN of the target group for Next.js ALB"
  type        = string
}

variable "nestjs_target_group_arn" {
  description = "ARN of the target group for NestJS ALB"
  type        = string
}

# ========================================
# Database Configuration
# ========================================

variable "rds_endpoint" {
  description = "RDS instance endpoint (hostname)"
  type        = string
  default     = ""
}

variable "rds_port" {
  description = "RDS instance port"
  type        = number
  default     = 3306
}

variable "rds_database_name" {
  description = "RDS database name"
  type        = string
  default     = ""
}

variable "rds_engine" {
  description = "RDS database engine (mysql or postgres)"
  type        = string
  default     = "mysql"
}

# ========================================
# Secrets Manager Configuration
# ========================================

variable "rds_master_user_secret_arn" {
  description = "ARN of the RDS master user secret (managed by AWS Secrets Manager)"
  type        = string
  default     = ""
}

# ==================================================
# Secrets Manager ARNs (from secrets-manager module)
# ==================================================

variable "redis_credentials_secret_arn" {
  description = "ARN of Redis credentials secret from Secrets Manager"
  type        = string
  default     = ""
}

variable "app_secrets_secret_arn" {
  description = "ARN of application secrets from Secrets Manager"
  type        = string
  default     = ""
}

variable "oauth_secrets_secret_arn" {
  description = "ARN of OAuth secrets from Secrets Manager"
  type        = string
  default     = ""
}

