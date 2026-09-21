# ========================================
# Development Environment Configuration
# ========================================

environment  = "dev"
project_name = "ecs-sample"
aws_region   = "ap-northeast-1"

vpc_cidr                  = "10.0.0.0/16"
availability_zones        = ["ap-northeast-1a"]
public_subnet_cidrs       = ["10.0.0.0/24"]
private_app_subnet_cidrs  = ["10.0.10.0/24"]
private_api_subnet_cidrs  = ["10.0.20.0/24"]
private_db_subnet_cidrs   = ["10.0.30.0/24"]
enable_nat_gateway        = true
enable_vpc_flow_logs      = false

ecs_cluster_name = "ecs-cluster"

nextjs_task_cpu          = 256
nextjs_task_memory       = 512
nextjs_desired_count     = 1
nextjs_min_capacity      = 1
nextjs_max_capacity      = 2
nextjs_environment_variables = []

nestjs_task_cpu          = 256
nestjs_task_memory       = 512
nestjs_desired_count     = 1
nestjs_min_capacity      = 1
nestjs_max_capacity      = 2
nestjs_environment_variables = []
nestjs_secrets           = []

rds_engine                = "postgres"
rds_engine_version        = "14"
rds_instance_class        = "db.t3.micro"
rds_allocated_storage     = 20
rds_backup_retention_days = 1
rds_multi_az              = false
rds_publicly_accessible   = false
rds_database_name         = "ecsdb"
rds_username              = "danmaku"
rds_password              = ""
rds_parameter_group_family = "postgres14"
rds_parameters            = {}
enable_enhanced_monitoring = false

ecr_nextjs_repository_name   = "ecs-nextjs"
ecr_nestjs_repository_name   = "ecs-nestjs"
ecr_image_scan_on_push       = false
ecr_image_tag_mutability     = "MUTABLE"

enable_https           = false
enable_alb_access_logs = false
alb_access_logs_bucket = ""

enable_artifact_bucket    = true
enable_logs_bucket        = true
s3_filesystem_kms_key_arn = ""

domain_name = "danmaku.cloud"

# ========================================
# Cloudflare Configuration (Dev)
# ========================================
enable_cloudflare              = true
cloudflare_api_token           = ""
cloudflare_ssl_mode            = "full"
cloudflare_security_level      = "medium"
enable_cloudflare_minify       = false
enable_cloudflare_rate_limiting = false
cloudflare_cache_ttl           = 300

cloudwatch_logs_kms_key_id = ""
enable_cloudtrail          = false
cloudtrail_bucket_name     = ""

github_token = ""

tags = {
  CostCenter = "Development"
  Owner      = "Platform Team"
}
