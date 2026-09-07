# ========================================
# RDS Module Outputs
# ========================================

output "db_instance_endpoint" {
  description = "RDS instance endpoint (connection string)"
  value       = module.rds.db_instance_endpoint
}

output "db_instance_address" {
  description = "RDS instance address (hostname only)"
  value       = module.rds.db_instance_address
}

output "db_instance_arn" {
  description = "ARN of the RDS instance"
  value       = module.rds.db_instance_arn
}

output "db_instance_master_user_secret_arn" {
  description = "ARN of the RDS master user secret (managed by AWS Secrets Manager)"
  value       = module.rds.db_instance_master_user_secret_arn
  sensitive   = true
}

output "db_instance_identifier" {
  description = "RDS instance identifier"
  value       = module.rds.db_instance_identifier
}

output "db_instance_name" {
  description = "Database name"
  value       = module.rds.db_instance_name
}

output "db_instance_port" {
  description = "Database port"
  value       = module.rds.db_instance_port
}

output "db_instance_username" {
  description = "Database master username"
  value       = module.rds.db_instance_username
  sensitive   = true
}

output "db_instance_status" {
  description = "RDS instance status"
  value       = module.rds.db_instance_status
}

output "rds_instance_endpoint" {
  description = "RDS instance endpoint (alias for compatibility)"
  value       = module.rds.db_instance_endpoint
}
