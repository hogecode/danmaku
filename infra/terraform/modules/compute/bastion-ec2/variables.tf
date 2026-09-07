# ========================================
# Bastion EC2 Module Variables
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
  description = "List of private subnet IDs for Bastion EC2"
  type        = list(string)
}

variable "bastion_security_group_id" {
  description = "Security group ID for bastion instance"
  type        = string
}

variable "enable_bastion" {
  description = "Enable bastion EC2 instance"
  type        = bool
  default     = true
}

variable "bastion_instance_type" {
  description = "EC2 instance type for bastion (t3.micro, t3.small, t3.medium)"
  type        = string
  default     = "t3.micro"

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium", "t2.micro", "t2.small"], var.bastion_instance_type)
    error_message = "Bastion instance type must be one of: t3.micro, t3.small, t3.medium, t2.micro, t2.small"
  }
}

variable "bastion_root_volume_size" {
  description = "Root volume size in GB for bastion instance"
  type        = number
  default     = 20

  validation {
    condition     = var.bastion_root_volume_size >= 8 && var.bastion_root_volume_size <= 1000
    error_message = "Root volume size must be between 8 and 1000 GB"
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
  description = "Application database username"
  type        = string
  default     = ""
  sensitive   = true
}

variable "app_db_password" {
  description = "Application database password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_read_only_password" {
  description = "Read-only database user password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_engine" {
  description = "Database engine type (mysql or postgres)"
  type        = string
  default     = "mysql"

  validation {
    condition     = contains(["mysql", "postgres", "mariadb"], var.db_engine)
    error_message = "Database engine must be one of: mysql, postgres, mariadb"
  }
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
