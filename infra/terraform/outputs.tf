# Root Module Outputs

# ========================================
# Phase 1: VPC & Network Configuration
# ========================================

# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr
}

# Subnets
output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "private_app_subnets" {
  description = "Private application layer subnet IDs"
  value       = module.vpc.private_app_subnets
}

output "private_db_subnets" {
  description = "Private database layer subnet IDs"
  value       = module.vpc.private_db_subnets
}

# NAT Gateway
output "nat_gateway_ids" {
  description = "NAT Gateway IDs"
  value       = module.vpc.nat_gateway_ids
}

output "nat_gateway_public_ips" {
  description = "NAT Gateway public IPs"
  value       = module.vpc.nat_gateway_public_ips
}

# Internet Gateway
output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.vpc.internet_gateway_id
}

# VPC Endpoints
output "vpc_endpoints" {
  description = "VPC Endpoints IDs"
  value       = module.vpc.vpc_endpoints
}

# Availability Zones
output "availability_zones" {
  description = "Availability zones used"
  value       = var.availability_zones
}


# ========================================
# Phase 2: Security Groups Configuration
# ========================================

output "alb_public_security_group_id" {
  description = "Public ALB security group ID"
  value       = module.security_group.alb_public_security_group_id
}

output "nextjs_security_group_id" {
  description = "Next.js ECS security group ID"
  value       = module.security_group.nextjs_security_group_id
}

output "nestjs_security_group_id" {
  description = "Go Server ECS security group ID"
  value       = module.security_group.nestjs_security_group_id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = module.security_group.rds_security_group_id
}

output "bastion_security_group_id" {
  description = "Bastion security group ID"
  value       = module.security_group.bastion_security_group_id
}


# ========================================
# Phase 3: Application Load Balancer Configuration
# ========================================

output "public_alb_id" {
  description = "ID of the public ALB"
  value       = module.alb.public_alb_id
}

output "public_alb_dns_name" {
  description = "DNS name of the public ALB"
  value       = module.alb.public_alb_dns_name
}

output "nextjs_target_group_arn" {
  description = "ARN of the Next.js target group"
  value       = module.alb.nextjs_target_group_arn
}

output "nestjs_target_group_arn" {
  description = "ARN of the Go Server target group"
  value       = module.alb.nestjs_target_group_arn
}

output "target_group_arn" {
  description = "Target group ARN (alias for nextjs_target_group_arn)"
  value       = module.alb.target_group_arn
}

output "target_group_name" {
  description = "Target group name (alias for nextjs_target_group_name)"
  value       = module.alb.target_group_name
}

# ========================================
# Phase 4: ECS Configuration
# ========================================

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = module.ecs.ecs_cluster_id
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.ecs.ecs_cluster_name
}

output "nextjs_log_group_name" {
  description = "CloudWatch Log Group name for Next.js"
  value       = module.ecs.nextjs_log_group_name
}

output "nestjs_log_group_name" {
  description = "CloudWatch Log Group name for Go server"
  value       = module.ecs.nestjs_log_group_name
}


# ========================================
# Phase 5: RDS Database Configuration
# ========================================

output "rds_instance_endpoint" {
  description = "RDS Instance endpoint (hostname:port)"
  value       = module.rds.db_instance_endpoint
}

output "rds_instance_address" {
  description = "RDS Instance hostname"
  value       = module.rds.db_instance_address
}

output "rds_instance_port" {
  description = "RDS Instance port"
  value       = module.rds.db_instance_port
}

output "rds_instance_name" {
  description = "RDS Instance database name"
  value       = module.rds.db_instance_name
}

# ========================================
# Phase 6: ElastiCache (Redis) Configuration
# ========================================

output "redis_endpoint" {
  description = "Redis cluster primary endpoint address"
  value       = module.cache.redis_endpoint
}

output "redis_port" {
  description = "Redis cluster port"
  value       = module.cache.redis_port
}

output "redis_replication_group_id" {
  description = "Redis Replication Group ID"
  value       = module.cache.redis_replication_group_id
}

output "redis_engine_version" {
  description = "Redis Engine Version"
  value       = module.cache.redis_engine_version
}

# ========================================
# Environment Information
# ========================================

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

