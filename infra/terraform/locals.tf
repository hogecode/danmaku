# ========================================
# Local Values and Computed Variables
# ========================================

locals {
  # ========================================
  # Naming Convention
  # ========================================
  name_prefix = "${var.project_name}-${var.environment}"

  # ========================================
  # Common Tags (Applied to all resources)
  # ========================================
  common_tags = merge(
    var.tags,
    {
      Project     = var.project_name
      Environment = var.environment
      Application = "ECS Sample"
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
    }
  )

  # ========================================
  # Environment Detection
  # ========================================
  is_dev              = var.environment == "dev"
  is_staging          = var.environment == "staging"
  is_prod             = var.environment == "prod"
  is_production_like  = local.is_prod || local.is_staging

  # ========================================
  # Network Configuration
  # ========================================
  az_count                   = length(var.availability_zones)
  public_subnet_count        = length(var.public_subnet_cidrs)
  private_app_subnet_count   = length(var.private_app_subnet_cidrs)
  private_api_subnet_count   = length(var.private_api_subnet_cidrs)
  private_db_subnet_count    = length(var.private_db_subnet_cidrs)

  # ========================================
  # Container Configuration (Auto-scaling)
  # ========================================
  # Next.js Service
  nextjs_desired_count = local.is_dev ? 1 : (local.is_staging ? 2 : 3)
  nextjs_min_capacity  = local.is_dev ? 1 : (local.is_staging ? 1 : 2)
  nextjs_max_capacity  = local.is_dev ? 5 : (local.is_staging ? 5 : 10)

  # Go Server Service
  go_server_desired_count = local.is_dev ? 1 : (local.is_staging ? 2 : 3)
  go_server_min_capacity  = local.is_dev ? 1 : (local.is_staging ? 1 : 2)
  go_server_max_capacity  = local.is_dev ? 5 : (local.is_staging ? 5 : 10)

  # ========================================
  # Database Configuration
  # ========================================
  # RDS backup retention based on environment
  rds_backup_retention_days = local.is_dev ? 3 : (local.is_staging ? 3 : 7)
  
  # Multi-AZ only for production-like environments
  rds_multi_az = local.is_production_like
  
  # Instance class based on environment
  rds_instance_class = local.is_dev ? "db.t3.small" : (local.is_staging ? "db.t3.small" : "db.t3.medium")

  # ========================================
  # Monitoring & Logging Configuration
  # ========================================
  # CloudWatch Logs retention in days
  logs_retention_days = local.is_dev ? 3 : (local.is_staging ? 14 : 30)
  
  # VPC Flow Logs (only for production)
  enable_vpc_flow_logs = local.is_prod

  # ========================================
  # Storage Configuration
  # ========================================
  # S3 versioning and lifecycle policies
  enable_s3_versioning = local.is_production_like
  enable_s3_encryption = true

  # ========================================
  # ECS Configuration
  # ========================================
  # Container Insights monitoring
  enable_container_insights = true

  # Fargate Spot for cost optimization
  enable_fargate_spot = local.is_dev ? false : true

  # Capacity provider settings
  capacity_provider_base_count = local.is_dev ? 1 : 1
  capacity_provider_spot_weight = local.is_dev ? 0 : 50

  # ========================================
  # Cost Optimization
  # ========================================
  # NAT Gateway count optimization
  nat_gateway_count = local.is_dev ? 1 : 2
  
  # VPC Endpoint usage for cost savings
  enable_vpc_endpoints = true
}
