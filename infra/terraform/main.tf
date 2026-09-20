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
locals {
  nextjs_environment_variables_merged = concat(
    [
      {
        name  = "NEXT_PUBLIC_API_BASE_URL"
        value = "http://${module.alb.public_alb_dns_name}/api"
      },
      {
        name  = "API_BASE_URL"
        value = "http://${module.alb.public_alb_dns_name}/api"
      },
      {
        name  = "NODE_ENV"
        value = "production"
      }
    ],
    var.nextjs_environment_variables
  )
}

module "ecs" {
  source = "./modules/compute/ecs"

  project_name              = var.project_name
  environment               = var.environment
  aws_region                = var.aws_region

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

  # Load Balancer Target Groups
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
  rds_master_user_secret_arn = module.rds.db_instance_master_user_secret_arn

  depends_on = [module.vpc, module.security_group, module.alb, module.ecr, module.rds]
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
#module "cache" {
#  source = "./modules/database/cache"
#
#  app_name              = var.project_name
#  environment           = var.environment
#  private_subnets      = module.vpc.private_app_subnets
#  redis_security_group_id = module.security_group.redis_security_group_id
#  redis_node_type      = "cache.t3.micro"
#  snapshot_retention_limit = 5
#  snapshot_window      = "03:00-05:00"
#  maintenance_window   = "sun:05:00-sun:06:00"
#  common_tags          = local.common_tags
#  depends_on = [module.vpc, module.security_group]
#}



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
# Phase 9: Email Service (SES)
# ========================================
#
#module "email" {
#  source = "./modules/messaging/email"
#
#  app_name                     = var.project_name
#  environment                  = var.environment
#  domain_name                  = var.domain_name
#  route53_zone_id              = var.route53_zone_id
#  test_email_addresses         = var.test_email_addresses
#  test_email_domains           = var.test_email_domains
#  test_domain_route53_zone_id  = var.test_domain_route53_zone_id
#  common_tags                  = local.common_tags
#}


# TODO: applyが終わらない問題を修正
/*
# ========================================
# Phase 9: Message Queue (SQS)
# ========================================
module "messaging" {
  source = "./modules/messaging/sqs"

  app_name           = var.project_name
  environment        = var.environment
  queue_names        = var.sqs_queue_names
  sqs_kms_key_arn    = try(module.storage.artifact_bucket_kms_key_id, "")
  common_tags        = local.common_tags
}
}
*/


# ========================================
# Phase 10: Lambda Functions (Dynamic Configuration)
# ========================================

# Load Lambda functions configuration from JSON file
locals {
  lambda_functions_config = jsondecode(file(var.lambda_functions_file))
  
  # Resolve S3 bucket references in configuration
  lambda_functions_resolved = {
    for name, config in local.lambda_functions_config : name => {
      description           = config.description
      source_path           = "${path.root}/../lambda/src/${config.source_path}"
      handler               = config.handler
      runtime               = config.runtime
      timeout               = config.timeout
      memory_size           = config.memory_size
      environment_variables = config.environment_variables
      s3_trigger = try({
        enabled     = config.s3_trigger.enabled
        bucket_id   = config.s3_trigger.bucket_ref == "file_upload_bucket_id" ? module.storage.file_upload_bucket_id : config.s3_trigger.bucket_ref
        key_prefix  = config.s3_trigger.key_prefix
        events      = config.s3_trigger.events
      }, null)
      s3_read_policy = try(config.s3_read_policy, false)
      tags           = merge(try(config.tags, {}), local.common_tags)
    }
  }
}

# Deploy Lambda functions dynamically from configuration
module "lambda_functions" {
  for_each = var.enable_s3_validation_lambda ? local.lambda_functions_resolved : {}

  source = "./modules/lambda"

  lambda_function_name = "${var.project_name}-${var.environment}-${each.key}"
  lambda_description   = each.value.description
  lambda_handler       = each.value.handler
  lambda_runtime       = each.value.runtime
  lambda_source_path   = each.value.source_path

  # Lambda configuration
  lambda_timeout     = each.value.timeout
  lambda_memory_size = each.value.memory_size

  # Environment variables
  environment_variables = each.value.environment_variables

  # S3 trigger configuration
  enable_s3_trigger = each.value.s3_trigger != null ? each.value.s3_trigger.enabled : false
  s3_bucket_id      = each.value.s3_trigger != null ? each.value.s3_trigger.bucket_id : ""
  s3_key_prefix     = each.value.s3_trigger != null ? each.value.s3_trigger.key_prefix : ""
  s3_events         = each.value.s3_trigger != null ? each.value.s3_trigger.events : []

  # IAM S3 read policy
  policy_statements = each.value.s3_read_policy && each.value.s3_trigger != null ? [
    {
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:HeadObject"
      ]
      Resource = "arn:aws:s3:::${each.value.s3_trigger.bucket_id}/*"
    },
    {
      Effect = "Allow"
      Action = [
        "s3:ListBucket",
        "s3:GetBucketVersioning"
      ]
      Resource = "arn:aws:s3:::${each.value.s3_trigger.bucket_id}"
    }
  ] : []

  # CloudWatch logs
  logs_retention_days = local.logs_retention_days

  # Tags
  common_tags = each.value.tags

  depends_on = [module.storage]
}



