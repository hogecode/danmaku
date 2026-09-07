# ========================================
# Bastion Fargate Module Variables
# ========================================

variable "project_name" {
  description = "Project name"
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
  default     = "ap-northeast-1"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for Fargate tasks"
  type        = list(string)
}

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "bastion_image_uri" {
  description = "ECR image URI for bastion container"
  type        = string
}

variable "container_cpu" {
  description = "CPU units for the task (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 256

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.container_cpu)
    error_message = "CPU must be one of: 256, 512, 1024, 2048, 4096"
  }
}

variable "container_memory" {
  description = "Memory (MB) for the task"
  type        = number
  default     = 512

  validation {
    condition     = var.container_memory >= 512 && var.container_memory <= 30720
    error_message = "Memory must be between 512 and 30720 MB"
  }
}

variable "logs_retention_days" {
  description = "CloudWatch Logs retention period in days"
  type        = number
  default     = 14

  validation {
    condition     = var.logs_retention_days > 0
    error_message = "Logs retention days must be positive"
  }
}

variable "rds_endpoint" {
  description = "RDS endpoint for database access"
  type        = string
  default     = ""
}

variable "rds_master_username" {
  description = "RDS master username"
  type        = string
  default     = ""
}

variable "rds_master_password_secret_arn" {
  description = "ARN of the secret containing RDS master password"
  type        = string
  default     = ""
}

variable "rds_database_name" {
  description = "RDS database name"
  type        = string
  default     = ""
}

variable "app_db_username" {
  description = "Application database username to create"
  type        = string
  default     = ""
}

variable "app_db_password" {
  description = "Application database password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_read_only_password" {
  description = "Read-only reporting database password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_engine" {
  description = "Database engine type (mysql, mariadb, postgres, aurora-mysql, aurora-postgresql)"
  type        = string
  default     = "mysql"

  validation {
    condition     = contains(["mysql", "mariadb", "postgres", "aurora-mysql", "aurora-postgresql"], var.db_engine)
    error_message = "Database engine must be one of: mysql, mariadb, postgres, aurora-mysql, aurora-postgresql"
  }
}

variable "bastion_security_group_id" {
  description = "Security group ID for bastion task"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
