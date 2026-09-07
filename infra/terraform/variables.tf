# ========================================
# REQUIRED: Basic Configuration
# ========================================

variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "ap-northeast-1"
  
  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-\\d{1}$", var.aws_region))
    error_message = "AWS region must be a valid region code (e.g., ap-northeast-1)."
  }
}

variable "project_name" {
  description = "Project name used for naming and tagging resources"
  type        = string
  default     = "ecs-sample"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod). Controls resource sizing, HA features, and cost optimization."
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}


# ========================================
# Network Configuration (VPC & Subnets)
# ========================================

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

variable "availability_zones" {
  description = "List of availability zones to use for resources. Dev uses 1 AZ, Staging/Prod use 2 AZs."
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
  
  validation {
    condition     = length(var.availability_zones) >= 1
    error_message = "At least one availability zone must be specified."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB). Should have 1-4 entries corresponding to AZs."
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private application layer subnets (Next.js ECS). Should match number of AZs."
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_api_subnet_cidrs" {
  description = "CIDR blocks for private API layer subnets (Go Server ECS). Should match number of AZs."
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks for private database layer subnets (RDS). Should match number of AZs."
  type        = list(string)
  default     = ["10.0.30.0/24", "10.0.31.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets to access internet. Recommended for all environments."
  type        = bool
  default     = true
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs for network monitoring and compliance. Automatically enabled in production."
  type        = bool
  default     = false
}


# ========================================
# ECS Container Configuration
# ========================================

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "ecs-cluster"
}

# Next.js Frontend Service
variable "nextjs_task_cpu" {
  description = "CPU units for Next.js task (256 = 0.25 vCPU, 512 = 0.5 vCPU, 1024 = 1 vCPU)"
  type        = number
  default     = 256
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.nextjs_task_cpu)
    error_message = "CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "nextjs_task_memory" {
  description = "Memory (MB) for Next.js task. Must be compatible with selected CPU."
  type        = number
  default     = 512
}

variable "nextjs_desired_count" {
  description = "Desired number of Next.js tasks. Automatically overridden by environment (Dev: 1, Staging: 2, Prod: 3)."
  type        = number
  default     = 2
}

variable "nextjs_min_capacity" {
  description = "Minimum number of Next.js tasks for auto scaling"
  type        = number
  default     = 1
}

variable "nextjs_max_capacity" {
  description = "Maximum number of Next.js tasks for auto scaling"
  type        = number
  default     = 10
}

# Go Server Backend Service
variable "go_server_task_cpu" {
  description = "CPU units for Go server task (256 = 0.25 vCPU, 512 = 0.5 vCPU, 1024 = 1 vCPU)"
  type        = number
  default     = 512
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.go_server_task_cpu)
    error_message = "CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "go_server_task_memory" {
  description = "Memory (MB) for Go server task. Must be compatible with selected CPU."
  type        = number
  default     = 1024
}

variable "go_server_desired_count" {
  description = "Desired number of Go server tasks. Automatically overridden by environment (Dev: 1, Staging: 2, Prod: 3)."
  type        = number
  default     = 2
}

variable "go_server_min_capacity" {
  description = "Minimum number of Go server tasks for auto scaling"
  type        = number
  default     = 1
}

variable "go_server_max_capacity" {
  description = "Maximum number of Go server tasks for auto scaling"
  type        = number
  default     = 10
}


# ========================================
# RDS Database Configuration
# ========================================

variable "rds_engine" {
  description = "RDS database engine (mysql or postgres)"
  type        = string
  default     = "mysql"
  
  validation {
    condition     = contains(["mysql", "postgres"], var.rds_engine)
    error_message = "RDS engine must be mysql or postgres."
  }
}

variable "rds_engine_version" {
  description = "RDS database engine version. Leave empty to use AWS default for selected engine."
  type        = string
  default     = "8.0"
}

variable "rds_instance_class" {
  description = "RDS instance class. Automatically set by environment (Dev: db.t3.small, Staging: db.t3.small, Prod: db.t3.medium)."
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "Initial RDS storage allocation in GB (Development and Staging only)"
  type        = number
  default     = 100
  
  validation {
    condition     = var.rds_allocated_storage >= 20 && var.rds_allocated_storage <= 65536
    error_message = "RDS allocated storage must be between 20 and 65536 GB."
  }
}

variable "rds_backup_retention_days" {
  description = "Number of days to retain RDS backups. Automatically set by environment (Dev: 3, Staging: 3, Prod: 7)."
  type        = number
  default     = 7
  
  validation {
    condition     = var.rds_backup_retention_days >= 1 && var.rds_backup_retention_days <= 35
    error_message = "Backup retention must be between 1 and 35 days."
  }
}

variable "rds_multi_az" {
  description = "Enable RDS Multi-AZ for high availability. Automatically enabled in staging/production."
  type        = bool
  default     = false
}

variable "rds_publicly_accessible" {
  description = "Allow public access to RDS. Not recommended for production."
  type        = bool
  default     = false
}

variable "rds_database_name" {
  description = "Initial database name to create"
  type        = string
  default     = "ecsdb"
}

variable "rds_username" {
  description = "Master username for RDS database"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "rds_password" {
  description = "Master password for RDS database. Use strong password with special characters."
  type        = string
  sensitive   = true
}

variable "rds_parameter_group_family" {
  description = "DB parameter group family (e.g., mysql8.0, postgres14)"
  type        = string
  default     = "mysql8.0"
}

variable "rds_parameters" {
  description = "Map of DB parameter group parameters"
  type        = map(string)
  default     = {}
}

variable "enable_enhanced_monitoring" {
  description = "Enable RDS Enhanced Monitoring"
  type        = bool
  default     = true
}


# ========================================
# ECR Container Registry Configuration
# ========================================

variable "ecr_repository_name" {
  description = "ECR repository name for Next.js frontend service (deprecated, use ecr_nextjs_repository_name)"
  type        = string
  default     = "ecs-nextjs"
}

variable "ecr_nextjs_repository_name" {
  description = "ECR repository name for Next.js frontend service"
  type        = string
  default     = "ecs-nextjs"
}

variable "ecr_go_server_repository_name" {
  description = "ECR repository name for Go server backend service"
  type        = string
  default     = "ecs-go-server"
}

variable "ecr_image_scan_on_push" {
  description = "Enable vulnerability scanning for images pushed to ECR"
  type        = bool
  default     = true
}

variable "ecr_image_tag_mutability" {
  description = "ECR image tag mutability (MUTABLE for dev/staging, IMMUTABLE for production)"
  type        = string
  default     = "IMMUTABLE"
  
  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.ecr_image_tag_mutability)
    error_message = "ECR image tag mutability must be MUTABLE or IMMUTABLE."
  }
}

# ========================================
# ALB Configuration
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

# ========================================
# Storage Configuration (S3)
# ========================================

variable "enable_artifact_bucket" {
  description = "Enable S3 bucket for artifact storage (CodePipeline artifacts, Lambda functions)"
  type        = bool
  default     = true
}

variable "enable_logs_bucket" {
  description = "Enable S3 bucket for logs (ALB access logs, WAF logs)"
  type        = bool
  default     = true
}

variable "s3_filesystem_kms_key_arn" {
  description = "ARN of KMS key for S3 filesystem encryption (optional)"
  type        = string
  default     = ""
}

# ========================================
# Domain & Route53 Configuration
# ========================================

variable "domain_name" {
  description = "Primary domain name for the application (e.g., example.com)"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 Hosted Zone ID for DNS management"
  type        = string
  default     = ""
}

# ========================================
# Email Service Configuration (SES)
# ========================================

variable "test_email_addresses" {
  description = "List of test email addresses for SES sandbox mode"
  type        = list(string)
  default     = []
}

variable "test_email_domains" {
  description = "List of test email domains for SES sandbox mode"
  type        = list(string)
  default     = []
}

variable "test_domain_route53_zone_id" {
  description = "Route53 Zone ID for test email domain verification"
  type        = string
  default     = ""
}

# ========================================
# Messaging Configuration (SQS)
# ========================================

variable "sqs_queue_names" {
  description = "List of SQS queue names to create"
  type        = list(string)
  default     = ["default", "email", "notifications"]
}

variable "sqs_kms_key_arn" {
  description = "ARN of KMS key for SQS encryption (optional)"
  type        = string
  default     = ""
}

# ========================================
# Monitoring & Logging Configuration
# ========================================

variable "cloudwatch_logs_kms_key_id" {
  description = "KMS key ID for CloudWatch Logs encryption (optional)"
  type        = string
  default     = ""
}

variable "cloudtrail_bucket_name" {
  description = "S3 bucket name for CloudTrail logs (optional)"
  type        = string
  default     = ""
}

variable "enable_cloudtrail" {
  description = "Enable CloudTrail for audit logging"
  type        = bool
  default     = false
}

# ========================================
# Resource Tagging
# ========================================

variable "tags" {
  description = "Additional tags to apply to all resources. Merged with default tags from locals."
  type        = map(string)
  default     = {}
}

# ========================================
# Lambda Configuration
# ========================================

variable "enable_s3_validation_lambda" {
  description = "Enable S3 file validation Lambda function and S3 event trigger"
  type        = bool
  default     = true
}

# ========================================
# Bastion EC2 Configuration
# ========================================

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
    error_message = "Bastion root volume size must be between 8 and 1000 GB"
  }
}

variable "rds_master_password_secret_arn" {
  description = "ARN of AWS Secrets Manager secret containing RDS master password"
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
  default     = ""
  sensitive   = true
}

variable "db_read_only_password" {
  description = "Read-only database user password"
  type        = string
  default     = ""
  sensitive   = true
}

# ========================================
# CI/CD Configuration
# ========================================

variable "github_token" {
  description = "GitHub personal access token for CodePipeline"
  type        = string
  sensitive   = true
  default     = ""
}

# ========================================
# KMS Configuration
# ========================================

variable "enable_kms_encryption" {
  description = "Enable KMS encryption for CloudWatch, RDS, S3, SQS, and Secrets Manager"
  type        = bool
  default     = false
}

variable "kms_deletion_window_days" {
  description = "KMS key deletion window in days (7-30)"
  type        = number
  default     = 10
  
  validation {
    condition     = var.kms_deletion_window_days >= 7 && var.kms_deletion_window_days <= 30
    error_message = "KMS deletion window must be between 7 and 30 days."
  }
}

# ========================================
# Next.js Environment Variables Configuration
# ========================================

variable "nextjs_environment_variables" {
  description = "Additional environment variables for Next.js container (ALB DNS is auto-configured)"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

# ========================================
# Lambda Functions Configuration
# ========================================

variable "lambda_functions" {
  description = "Map of Lambda function definitions. Each key is the function name, value contains function configuration."
  type = map(object({
    description           = string
    source_path           = string
    handler               = string
    runtime               = string
    timeout               = number
    memory_size           = number
    environment_variables = map(string)
    s3_trigger = optional(object({
      enabled     = bool
      bucket_ref  = string
      key_prefix  = string
      events      = list(string)
    }))
    s3_read_policy = optional(bool, false)
    tags           = optional(map(string), {})
  }))
  default = {}
}

variable "lambda_functions_file" {
  description = "Path to JSON file containing Lambda function definitions"
  type        = string
  default     = "lambda_functions.json"
}
