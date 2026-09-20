# Secrets Manager Module Outputs
# References existing secrets in AWS Secrets Manager

output "rds_credentials_secret_arn" {
  value       = data.aws_secretsmanager_secret.rds_credentials.arn
  description = "ARN of RDS credentials secret"
}

output "redis_credentials_secret_arn" {
  value       = data.aws_secretsmanager_secret.redis_credentials.arn
  description = "ARN of Redis credentials secret"
}

output "app_secrets_secret_arn" {
  value       = data.aws_secretsmanager_secret.app_secrets.arn
  description = "ARN of application secrets"
}

output "oauth_secrets_secret_arn" {
  value       = data.aws_secretsmanager_secret.oauth_secrets.arn
  description = "ARN of OAuth secrets"
}
