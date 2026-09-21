# ========================================
# Development Environment Configuration
# ========================================
# Purpose: Lightweight development setup for testing
# Cost Focus: Minimal resources for low costs
# HA: Single AZ
#
# USAGE: Copy this file to dev.tfvars and update the values for your environment
# NOTE: This file is tracked in version control as a template

# Basic Configuration
environment  = "prod"
project_name = "ecs-sample"
aws_region   = "ap-northeast-1"

# Network Configuration
vpc_cidr                  = "10.0.0.0/16"
availability_zones        = ["ap-northeast-1a", "ap-northeast-1c"]
public_subnet_cidrs       = ["10.0.0.0/24", "10.0.1.0/24"]
private_app_subnet_cidrs  = ["10.0.10.0/24", "10.0.11.0/24"]
private_api_subnet_cidrs  = ["10.0.20.0/24", "10.0.21.0/24"]
private_db_subnet_cidrs   = ["10.0.30.0/24", "10.0.31.0/24"]
enable_nat_gateway        = true
enable_vpc_flow_logs      = true

# ECS Cluster
ecs_cluster_name = "ecs-cluster"

# ECS - Next.js Service
nextjs_task_cpu     = 256      # CPU units: 256=0.25vCPU, 512=0.5vCPU, 1024=1vCPU
nextjs_task_memory  = 512      # Memory in MB
nextjs_desired_count = 1       # Desired number of tasks
nextjs_min_capacity = 1        # Minimum for auto-scaling
nextjs_max_capacity = 5        # Maximum for auto-scaling

# Next.js Environment Variables
# Note: These will be merged with dynamic values in main.tf (NEXT_PUBLIC_API_BASE_URL, NODE_ENV, etc.)
nextjs_environment_variables = [
  {
    name  = "NEXT_PUBLIC_APP_NAME"
    value = "Danmaku"
  },
  {
    name  = "LOG_LEVEL"
    value = "info"
  },
  {
    name  = "NEXT_PUBLIC_LOG_LEVEL"
    value = "debug"
  }
]

# ECS - Nest.js Service
nestjs_task_cpu      = 512  # CPU units: 256=0.25vCPU, 512=0.5vCPU, 1024=1vCPU
nestjs_task_memory   = 1024 # Memory in MB
nestjs_desired_count = 1    # Desired number of tasks
nestjs_min_capacity  = 1    # Minimum for auto-scaling
nestjs_max_capacity  = 5    # Maximum for auto-scaling

# NestJS Environment Variables
# Note: Database and Redis credentials are injected from AWS Secrets Manager
nestjs_environment_variables = [
  {
    name  = "LOG_LEVEL"
    value = "info"
  },
  {
    name  = "NODE_ENV"
    value = "production"
  }
]
nestjs_secrets = []

# RDS Database
rds_engine                = "postgres"       # Database engine (postgres or mysql)
rds_engine_version        = "14"          # PostgreSQL version (14, 15, 16) or MySQL (8.0.xx)
rds_instance_class        = "db.t3.micro" # Instance type (dev: micro, staging: small, prod: medium)
rds_allocated_storage     = 20            # Storage in GB (minimum 20)
rds_backup_retention_days = 3             # Backup retention (dev: 3, prod: 7)
rds_multi_az              = false          # High availability (dev: false, prod: true)
rds_publicly_accessible   = false          # Should never be true in production
rds_database_name         = "ecsdb"       # Initial database name
rds_username              = "danmaku"    # Master username (not 'admin' - reserved word in PostgreSQL)
rds_password              = ""            # IMPORTANT: Set a strong password or use AWS Secrets Manager
rds_parameter_group_family = "postgres14"   # Parameter group family (mysql8.0 or postgres14, etc.)
rds_parameters            = {}            # Custom DB parameters as map (e.g., {"max_connections" = "1000"})
enable_enhanced_monitoring = true          # Enable RDS Enhanced Monitoring

# ElastiCache (Redis)
redis_node_type = "cache.t3.micro"  # Redis node type (dev: micro, staging: small, prod: medium)
redis_snapshot_retention_limit = 0  # Number of days to retain snapshots (0 to disable backups for dev)
redis_snapshot_window = "03:00-05:00"  # Daily time window for snapshots (UTC)
redis_maintenance_window = "sun:05:00-sun:06:00"  # Weekly maintenance window (UTC)

# ECR (Elastic Container Registry)
ecr_nextjs_repository_name   = "ecs-nextjs"       # Repository name for Next.js service
ecr_nestjs_repository_name = "ecs-nestjs"   # Repository name for Nest.js service
ecr_image_scan_on_push       = true               # Scan images for vulnerabilities on push
ecr_image_tag_mutability     = "MUTABLE"          # MUTABLE for dev/staging, IMMUTABLE for prod

# ALB (Application Load Balancer)
enable_https           = true            # Enable HTTPS listener (requires valid domain_name with ACM certificate)
enable_alb_access_logs = true            # Enable ALB access logs
alb_access_logs_bucket = ""              # S3 bucket for ALB logs (required if enable_alb_access_logs is true)

# S3 Storage
enable_artifact_bucket      = true         # S3 bucket for artifacts (CodePipeline, Lambda functions)
enable_logs_bucket          = true         # S3 bucket for logs (ALB access logs, WAF logs)
s3_filesystem_kms_key_arn   = ""           # Optional: ARN of KMS key for S3 encryption

# Domain & Route53
domain_name     = "danmaku.cloud"                       # Primary domain name (e.g., example.com)

# ========================================
# Cloudflare Configuration
# ========================================
enable_cloudflare              = true
# cloudflare_api_token must be set via environment variable TF_VAR_cloudflare_api_token
cloudflare_api_token           = ""
cloudflare_ssl_mode            = "full"
cloudflare_security_level      = "high"
enable_cloudflare_minify       = true
enable_cloudflare_rate_limiting = true
cloudflare_cache_ttl           = 3600

# Monitoring & Logging (CloudWatch, CloudTrail)
cloudwatch_logs_kms_key_id = ""            # Optional: KMS key ID for CloudWatch Logs encryption
enable_cloudtrail          = false         # Enable CloudTrail for audit logging
cloudtrail_bucket_name     = ""            # S3 bucket for CloudTrail logs (required if enable_cloudtrail is true)

# CI/CD
github_token = ""  # IMPORTANT: Set your GitHub personal access token for CodePipeline (sensitive - never commit with value)

# Resource Tagging
tags = {
  CostCenter = "Development"
  Owner      = "Platform Team"
  # Add more tags as needed
}
