# ========================================
# KMS Module Outputs
# ========================================

# CloudWatch Logs KMS Key Outputs
output "cloudwatch_logs_key_id" {
  description = "KMS key ID for CloudWatch Logs"
  value       = try(aws_kms_key.cloudwatch_logs[0].id, "")
}

output "cloudwatch_logs_key_arn" {
  description = "KMS key ARN for CloudWatch Logs"
  value       = try(aws_kms_key.cloudwatch_logs[0].arn, "")
}

# RDS KMS Key Outputs
output "rds_key_id" {
  description = "KMS key ID for RDS"
  value       = try(aws_kms_key.rds[0].id, "")
}

output "rds_key_arn" {
  description = "KMS key ARN for RDS"
  value       = try(aws_kms_key.rds[0].arn, "")
}

# S3 KMS Key Outputs
output "s3_key_id" {
  description = "KMS key ID for S3"
  value       = try(aws_kms_key.s3[0].id, "")
}

output "s3_key_arn" {
  description = "KMS key ARN for S3"
  value       = try(aws_kms_key.s3[0].arn, "")
}

# SQS KMS Key Outputs
output "sqs_key_id" {
  description = "KMS key ID for SQS"
  value       = try(aws_kms_key.sqs[0].id, "")
}

output "sqs_key_arn" {
  description = "KMS key ARN for SQS"
  value       = try(aws_kms_key.sqs[0].arn, "")
}

# Secrets Manager KMS Key Outputs
output "secrets_manager_key_id" {
  description = "KMS key ID for Secrets Manager"
  value       = try(aws_kms_key.secrets_manager[0].id, "")
}

output "secrets_manager_key_arn" {
  description = "KMS key ARN for Secrets Manager"
  value       = try(aws_kms_key.secrets_manager[0].arn, "")
}
