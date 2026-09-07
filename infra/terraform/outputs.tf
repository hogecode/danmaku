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

output "private_api_subnets" {
  description = "Private API layer subnet IDs"
  value       = module.vpc.private_api_subnets
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

output "private_alb_security_group_id" {
  description = "Private ALB security group ID"
  value       = module.security_group.private_alb_security_group_id
}

output "go_server_security_group_id" {
  description = "Go Server ECS security group ID"
  value       = module.security_group.go_server_security_group_id
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

output "private_alb_dns_name" {
  description = "DNS name of the private ALB"
  value       = module.alb.private_alb_dns_name
}

output "nextjs_target_group_arn" {
  description = "ARN of the Next.js target group"
  value       = module.alb.nextjs_target_group_arn
}

output "go_server_target_group_arn" {
  description = "ARN of the Go Server target group"
  value       = module.alb.go_server_target_group_arn
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

output "go_server_log_group_name" {
  description = "CloudWatch Log Group name for Go server"
  value       = module.ecs.go_server_log_group_name
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


# ========================================
# Phase 10: Lambda Functions Configuration
# ========================================

output "lambda_functions" {
  description = "Lambda functions information (ARN, name, invoke ARN)"
  value = {
    for name, lambda_module in module.lambda_functions : name => {
      function_arn       = lambda_module.lambda_function_arn
      function_name      = lambda_module.lambda_function_name
      function_invoke_arn = lambda_module.lambda_function_invoke_arn
      role_arn           = lambda_module.lambda_role_arn
      role_name          = lambda_module.lambda_role_name
      log_group_name     = lambda_module.lambda_cloudwatch_log_group_name
      log_group_arn      = lambda_module.lambda_cloudwatch_log_group_arn
    }
  }
  sensitive = false
}

output "lambda_functions_summary" {
  description = "Summary of deployed Lambda functions"
  value       = "Deployed ${length(module.lambda_functions)} Lambda function(s): ${join(", ", keys(module.lambda_functions))}"
}
