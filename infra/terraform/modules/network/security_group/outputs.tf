# Security Group Module Outputs

output "alb_public_security_group_id" {
  description = "Public ALB Security Group ID"
  value       = module.alb_public_sg.security_group_id
}

output "nextjs_security_group_id" {
  description = "Next.js ECS Security Group ID"
  value       = module.nextjs_sg.security_group_id
}

output "private_alb_security_group_id" {
  description = "Private ALB Security Group ID"
  value       = module.private_alb_sg.security_group_id
}

output "go_server_security_group_id" {
  description = "Go Server ECS Security Group ID"
  value       = module.go_server_sg.security_group_id
}

output "rds_security_group_id" {
  description = "RDS Security Group ID"
  value       = module.rds_sg.security_group_id
}

output "bastion_security_group_id" {
  description = "Bastion Security Group ID"
  value       = module.bastion_sg.security_group_id
}

output "vpc_endpoints_security_group_id" {
  description = "VPC Endpoints Security Group ID"
  value       = module.vpc_endpoints_sg.security_group_id
}

output "redis_security_group_id" {
  description = "Redis Cache Security Group ID"
  value       = module.redis_sg.security_group_id
}

output "s3_filesystem_kms_key_arn" {
  description = "S3 Filesystem KMS Key ARN"
  value       = null
}
