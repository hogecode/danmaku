# RDS Module Variables

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

# ========================================
# Network Configuration
# ========================================

variable "private_db_subnet_ids" {
  description = "List of private DB subnet IDs"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

# ========================================
# RDS Engine Configuration
# ========================================

variable "rds_engine" {
  description = "RDS database engine"
  type        = string
  default     = "mysql"

  validation {
    condition     = contains(["mysql", "postgres"], var.rds_engine)
    error_message = "RDS engine must be mysql or postgres"
  }
}

variable "rds_engine_version" {
  description = "RDS database engine version"
  type        = string
  default     = "8.0"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 100

  validation {
    condition     = var.rds_allocated_storage >= 20 && var.rds_allocated_storage <= 65536
    error_message = "Allocated storage must be between 20 and 65536 GB"
  }
}

variable "rds_database_name" {
  description = "Initial database name"
  type        = string
  default     = "ecsdb"
}

variable "rds_username" {
  description = "Master username (AWS auto-managed when using manage_master_user_password=true)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "rds_password" {
  description = "Master password (AWS auto-managed when using manage_master_user_password=true)"
  type        = string
  default     = ""
  sensitive   = true
}

# ========================================
# RDS Parameter Group
# ========================================

variable "rds_parameter_group_family" {
  description = "DB parameter group family"
  type        = string
  default     = "mysql8.0"
}

variable "rds_parameters" {
  description = "Map of DB parameter group parameters"
  type        = map(string)
  default     = {}
}

# ========================================
# High Availability & Backup
# ========================================

variable "rds_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "rds_backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 7

  validation {
    condition     = var.rds_backup_retention_days >= 1 && var.rds_backup_retention_days <= 35
    error_message = "Backup retention must be between 1 and 35 days"
  }
}

variable "rds_publicly_accessible" {
  description = "Allow public access to RDS"
  type        = bool
  default     = false
}

# ========================================
# Monitoring & Logging
# ========================================

variable "enable_enhanced_monitoring" {
  description = "Enable RDS Enhanced Monitoring"
  type        = bool
  default     = true
}

# ========================================
# Snapshots
# ========================================

variable "create_manual_snapshot" {
  description = "Create manual snapshot on apply"
  type        = bool
  default     = false
}
