# ========================================
# Root Module - Infrastructure Orchestration
# VPC, SG, ACM, ALB, ECS, Bastion, S3, RDS,  CloudWatch, CI/CD, ElastiCache, Lambda, SES, SQS,
# ========================================
# TODO: cloudflareも追加する


# Get current AWS account ID
data "aws_caller_identity" "current" {}

# ========================================
# Phase 1: VPC & Network Configuration
# ========================================
module "vpc" {
  source = "./modules/network/vpc"

  # Basic configuration
  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  
  # Network CIDR configuration
  vpc_cidr                  = var.vpc_cidr
  availability_zones        = var.availability_zones
  public_subnet_cidrs       = var.public_subnet_cidrs
  # TODO: CIDRを見直す
  private_app_subnet_cidrs  = var.private_app_subnet_cidrs
  private_api_subnet_cidrs  = var.private_api_subnet_cidrs
  private_db_subnet_cidrs   = var.private_db_subnet_cidrs
  
  # NAT Gateway & Flow Logs (auto-configured by environment)
  enable_nat_gateway        = var.enable_nat_gateway
  nat_gateway_count         = local.nat_gateway_count
  enable_vpc_flow_logs      = local.enable_vpc_flow_logs
  
  # Tags
  tags = local.common_tags
}


# ========================================
# Phase 2: Security Groups Configuration
# ========================================
module "security_group" {
  source = "./modules/network/security_group"

  # Basic configuration
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = module.vpc.vpc_cidr
}

# ========================================
# Phase 2: KMS Configuration
# ========================================
module "kms" {
  source = "./modules/security/kms"

  project_name            = var.project_name
  environment             = var.environment
  enable_kms_encryption   = var.enable_kms_encryption
  kms_deletion_window_days = var.kms_deletion_window_days
  common_tags             = local.common_tags

  depends_on = [module.security_group]
}


# ========================================
# Phase 3: SSL/TLS Certificates (ACM)
# ========================================
# danmaku.cloudのSSL/TLS証明書を管理するモジュール
module "certificates" {
  source = "./modules/cdn/certificates"

  app_name                  = var.project_name
  environment               = var.environment
  domain_name              = var.domain_name
  common_tags              = local.common_tags

  depends_on = [module.vpc]
}



# ========================================
# Phase 3: Application Load Balancer Configuration
# ========================================
module "alb" {
  source = "./modules/network/alb"

  project_name                    = var.project_name
  environment                     = var.environment
  vpc_id                          = module.vpc.vpc_id
  public_subnet_ids              = module.vpc.public_subnets
  alb_public_security_group_id   = module.security_group.alb_public_security_group_id

  # HTTPS configuration (optional)
  enable_https        = var.enable_https
  # Use ACM certificate from certificates module
  alb_certificate_arn = var.enable_https ? module.certificates.certificate_arn : ""

  # Access logs (optional)
  enable_alb_access_logs = var.enable_alb_access_logs
  alb_access_logs_bucket = var.alb_access_logs_bucket

  depends_on = [module.security_group, module.vpc, module.certificates]
}

# ========================================
# ALB Listener Rules for NestJS API Routing
# ========================================
# Route /api/* paths to NestJS target group

# ========================================
# HTTP to HTTPS Redirect (if HTTPS is enabled)
# ========================================
# Priority 1: Redirect all HTTP traffic to HTTPS
resource "aws_lb_listener_rule" "http_to_https_redirect" {
  count = var.enable_https ? 1 : 0

  listener_arn = module.alb.public_alb_http_listener_arn
  priority     = 1

  action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

# HTTP listener rule for /api/* -> NestJS
# Priority 2 because priority 1 is reserved for HTTP->HTTPS redirect (if HTTPS is enabled)
resource "aws_lb_listener_rule" "http_api_to_nestjs" {
  listener_arn = module.alb.public_alb_http_listener_arn
  priority     = var.enable_https ? 2 : 1

  action {
    type             = "forward"
    target_group_arn = module.alb.nestjs_target_group_arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# HTTPS listener rule for /api/* -> NestJS (if HTTPS is enabled)
resource "aws_lb_listener_rule" "https_api_to_nestjs" {
  count = var.enable_https ? 1 : 0

  listener_arn = module.alb.public_alb_https_listener_arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = module.alb.nestjs_target_group_arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ========================================
# Phase 4: ECR Configuration
# ========================================
module "ecr" {
  source = "./modules/compute/ecr"
  
  # ECR Configuration
  ecr_nextjs_repository_name     = var.ecr_nextjs_repository_name
  ecr_nestjs_repository_name  = var.ecr_nestjs_repository_name
  ecr_image_scan_on_push         = var.ecr_image_scan_on_push
  ecr_image_tag_mutability       = var.ecr_image_tag_mutability
}


# ========================================
# Phase 5: Storage (S3)
# ========================================
module "storage" {
  source = "./modules/storage/s3"

  app_name                   = var.project_name
  environment                = var.environment
  domain_name                = var.domain_name
  aws_region                 = var.aws_region
  s3_filesystem_kms_key_arn  = module.security_group.s3_filesystem_kms_key_arn
  caller_identity_account_id = data.aws_caller_identity.current.account_id
  common_tags                = local.common_tags
}


# ========================================
# Phase 6: RDS Database Configuration
# ========================================
module "rds" {
  source = "./modules/database/rds"

  project_name              = var.project_name
  environment               = var.environment
  private_db_subnet_ids     = module.vpc.private_db_subnets
  rds_security_group_id     = module.security_group.rds_security_group_id

  # RDS Engine Configuration
  rds_engine                = var.rds_engine
  rds_engine_version        = var.rds_engine_version
  rds_instance_class        = local.rds_instance_class
  rds_allocated_storage     = var.rds_allocated_storage
  rds_database_name         = var.rds_database_name
  rds_username              = var.rds_username

  # High Availability
  rds_multi_az              = local.rds_multi_az
  rds_backup_retention_days = local.rds_backup_retention_days
  rds_publicly_accessible   = var.rds_publicly_accessible

   # Monitoring & Parameters
  rds_parameter_group_family = var.rds_parameter_group_family
  rds_parameters            = var.rds_parameters
  enable_enhanced_monitoring = var.enable_enhanced_monitoring

  # RDS depends only on infrastructure, not on secrets versions
  depends_on = [module.vpc, module.security_group]
}

# ========================================
# Phase 4: ECS Configuration
# ========================================

# Construct NextJS environment variables with dynamic ALB DNS reference
# IMPORTANT:
# - NEXT_PUBLIC_API_* は ブラウザから使用 (クライアント側 API、ALB経由)
# - API_URL は Next.js サーバーから使用 (サーバー側 API、内部ネットワーク経由)
locals {
  alb_dns_name = try(module.alb.public_alb_dns_name, "localhost")
  nextjs_environment_variables_merged = concat(
    var.nextjs_environment_variables,
    [
      # ========================================
      # ブラウザ側 API (ALB 経由、インターネット)
      # ========================================
      {
        name  = "NEXT_PUBLIC_API_BASE_URL"
        value = var.enable_https ? "https://${var.domain_name}" : length(local.alb_dns_name) > 0 && local.alb_dns_name != "localhost" ? "http://${local.alb_dns_name}" : "http://localhost:8080"
      },
      {
        name  = "NEXT_PUBLIC_API_URL"
        value = var.enable_https ? "https://${var.domain_name}/api" : length(local.alb_dns_name) > 0 && local.alb_dns_name != "localhost" ? "http://${local.alb_dns_name}/api" : "http://localhost:8080/api"
      },
      # ========================================
      # サーバー側 API (内部ネットワーク、DNS)
      # ========================================
      # Note: NestJS サービスは同一 VPC 内の private subnet で動作
      # DNS 解決: nestjs-service:3001 (ECS Service Discovery で内部 DNS を提供)
      # または NestJS タスクの IP を直接指定（CloudMap 未使用時）
      {
        name  = "API_URL"
        value = "http://nestjs-service:3001"  # CloudMap/Service Discovery 使用時
      },
      {
        name  = "NODE_ENV"
        value = var.environment
      }
    ]
  )
}

module "ecs" {
  source = "./modules/compute/ecs"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  vpc_id                    = module.vpc.vpc_id

  # ECR Configuration
  ecr_nextjs_repository_name     = var.ecr_nextjs_repository_name
  ecr_nestjs_repository_name  = var.ecr_nestjs_repository_name
  ecr_nextjs_repository_url      = module.ecr.nextjs_repository_url
  ecr_nestjs_repository_url   = module.ecr.nestjs_repository_url
  ecr_image_scan_on_push         = var.ecr_image_scan_on_push
  ecr_image_tag_mutability       = var.ecr_image_tag_mutability

  # ECS Cluster Configuration
  enable_container_insights      = local.enable_container_insights
  enable_fargate_spot            = local.enable_fargate_spot
  capacity_provider_base_count   = local.capacity_provider_base_count
  capacity_provider_spot_weight  = local.capacity_provider_spot_weight

  # Logging Configuration
  logs_retention_days = local.logs_retention_days

  # Network Configuration
  private_app_subnet_ids    = module.vpc.private_app_subnets
  private_api_subnet_ids    = module.vpc.private_api_subnets
  nextjs_security_group_id  = module.security_group.nextjs_security_group_id
  nestjs_security_group_id = module.security_group.nestjs_security_group_id

  # Load Balancer Configuration
  alb_dns_name               = module.alb.public_alb_dns_name
  nextjs_target_group_arn   = module.alb.nextjs_target_group_arn
  nestjs_target_group_arn   = module.alb.nestjs_target_group_arn

  # RDS Database Configuration
  rds_endpoint        = module.rds.db_instance_address
  rds_port            = module.rds.db_instance_port
  rds_database_name   = module.rds.db_instance_name
  rds_engine          = var.rds_engine

  # NextJS Environment Variables (with dynamic ALB DNS reference)
  nextjs_environment_variables = local.nextjs_environment_variables_merged

  # NestJS Environment Variables and Secrets
  nestjs_environment_variables = var.nestjs_environment_variables
  nestjs_secrets               = var.nestjs_secrets

  # Secrets Manager Configuration
  # RDS credentials are automatically managed by AWS RDS (manage_master_user_password = true)
  rds_master_user_secret_arn   = module.rds.db_instance_master_user_secret_arn
  
  # Other secrets (Redis, App, OAuth) are manually created in AWS Secrets Manager
  redis_credentials_secret_arn = module.secrets_manager.redis_credentials_secret_arn
  app_secrets_secret_arn       = module.secrets_manager.app_secrets_secret_arn
  oauth_secrets_secret_arn     = module.secrets_manager.oauth_secrets_secret_arn

  depends_on = [module.vpc, module.security_group, module.alb, module.ecr, module.rds, module.secrets_manager]
}

# ========================================
# Phase 4: Bastion EC2 Configuration
# ========================================
module "bastion_ec2" {
  source = "./modules/compute/bastion-ec2"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region
  
  # Network Configuration
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_api_subnets
  bastion_security_group_id = module.security_group.bastion_security_group_id
  
  # EC2 Configuration
  enable_bastion        = var.enable_bastion
  bastion_instance_type = var.bastion_instance_type
  bastion_root_volume_size = var.bastion_root_volume_size
  
  # Logging Configuration
  logs_retention_days = local.logs_retention_days
  
  # Database Configuration
  rds_endpoint                   = module.rds.rds_instance_endpoint
  rds_master_username            = var.rds_username
  rds_master_password_secret_arn = var.rds_master_password_secret_arn
  rds_database_name              = var.rds_database_name
  
  # Application Database Configuration
  app_db_username  = var.app_db_username
  app_db_password  = var.app_db_password
  db_read_only_password = var.db_read_only_password
  db_engine        = var.rds_engine
  
  # Tags
  tags = local.common_tags

  depends_on = [module.vpc, module.security_group]
}


# ========================================
# Phase 6: ElastiCache (Redis) Configuration
# ========================================
module "cache" {
  source = "./modules/database/cache"

  app_name              = var.project_name
  environment           = var.environment
  private_subnets      = module.vpc.private_app_subnets
  redis_security_group_id = module.security_group.redis_security_group_id
  redis_node_type      = "cache.t3.micro"
  snapshot_retention_limit = 5
  snapshot_window      = "03:00-05:00"
  maintenance_window   = "sun:05:00-sun:06:00"
  common_tags          = local.common_tags
  
  depends_on = [module.vpc, module.security_group]
}



# ========================================
# Phase 7: Monitoring & Logging
# ========================================
module "monitoring" {
  source = "./modules/monitoring/cloudwatch"

  app_name                     = var.project_name
  environment                  = var.environment
  cloudwatch_logs_kms_key_id   = var.enable_kms_encryption ? module.kms.cloudwatch_logs_key_id : var.cloudwatch_logs_kms_key_id
  cloudtrail_bucket_name       = var.cloudtrail_bucket_name
  common_tags                  = local.common_tags

  depends_on = [module.ecs, module.rds, module.alb, module.kms]
}


# ========================================
# Phase 7.5: Secrets Manager Configuration
# ========================================
module "secrets_manager" {
  source = "./modules/secrets/secrets-manager"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  # Auto-generate Redis credentials with ElastiCache endpoint
  redis_endpoint = module.cache.redis_endpoint
  redis_port     = module.cache.redis_port

  # Note: This module references existing secrets in AWS Secrets Manager
  # Secrets must be created beforehand via AWS CLI, Console, or CI/CD:
  #   aws secretsmanager create-secret --name "danmaku/dev/rds/credentials" --secret-string '{"username":"...","password":"..."}'
  #   aws secretsmanager create-secret --name "danmaku/dev/redis/credentials" --secret-string '{"host":"...","port":6379}'
  #   aws secretsmanager create-secret --name "danmaku/dev/app/secrets" --secret-string '{"jwt_secret":"...","session_secret":"..."}'
  #   aws secretsmanager create-secret --name "danmaku/dev/oauth/secrets" --secret-string '{"google_client_id":"...","google_client_secret":"..."}'

  depends_on = [module.rds, module.cache]
}

# ========================================
# Phase 8: GitHub OIDC IAM Role (CI/CD)
# ========================================
module "cicd" {
  source = "./modules/cicd"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # GitHub OIDC Configuration
  github_oidc_subject_claim = var.github_oidc_subject_claim

  # ECR Configuration
  ecr_nextjs_repository_name = var.ecr_nextjs_repository_name
  ecr_nestjs_repository_name = var.ecr_nestjs_repository_name

  # Tags
  common_tags = local.common_tags

  depends_on = [module.ecr]
}

# ========================================
# Phase 8: Cloudflare CDN & DNS Management
# ========================================
module "cloudflare" {
  count  = var.enable_cloudflare && var.cloudflare_api_token != "" ? 1 : 0
  source = "./modules/cdn/cloudflare"

  domain_name              = var.domain_name
  subdomain_prefix         = ""
  environment              = var.environment
  alb_dns_name             = module.alb.public_alb_dns_name
  cloudflare_account_id    = var.cloudflare_account_id
  
  ssl_mode                 = var.cloudflare_ssl_mode
  min_tls_version          = "1.2"
  security_level           = var.cloudflare_security_level
  enable_bot_fight_mode    = var.environment != "dev"
  cache_level              = var.environment == "dev" ? "simplified" : "aggressive"
  browser_cache_ttl        = var.cloudflare_cache_ttl
  enable_minify            = var.enable_cloudflare_minify
  enable_rocket_loader     = var.environment != "dev"
  enable_hotlink_protection = var.environment == "prod"
  development_mode         = var.environment == "dev"
  enable_rate_limiting     = var.enable_cloudflare_rate_limiting && var.environment != "dev"
  api_rate_limit_threshold = 1000
  api_rate_limit_period    = 3600
  enable_cache_rules       = true
  enable_logpush           = false
  s3_logpush_bucket        = ""
  common_tags              = local.common_tags

  depends_on = [module.alb]
}

