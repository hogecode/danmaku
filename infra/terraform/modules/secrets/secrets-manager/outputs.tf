# Secrets Manager Module Outputs

# ==================================================
# Redis Credentials Secret (Auto-created)
# ==================================================
output "redis_credentials_secret_arn" {
  value       = aws_secretsmanager_secret.redis_credentials.arn
  description = "ARN of Redis credentials secret (auto-created and updated with ElastiCache endpoint)"
}

output "redis_credentials_secret_id" {
  value       = aws_secretsmanager_secret.redis_credentials.id
  description = "ID of Redis credentials secret"
}

# ==================================================
# App Secrets (Auto-created or referenced)
# ==================================================
output "app_secrets_secret_arn" {
  value       = var.create_app_secrets ? aws_secretsmanager_secret.app_secrets[0].arn : data.aws_secretsmanager_secret.app_secrets[0].arn
  description = "ARN of application secrets (auto-created if create_app_secrets=true, otherwise referenced)"
}

output "app_secrets_secret_id" {
  value       = var.create_app_secrets ? aws_secretsmanager_secret.app_secrets[0].id : data.aws_secretsmanager_secret.app_secrets[0].id
  description = "ID of application secrets"
}

# ==================================================
# OAuth Secrets (Auto-created or referenced)
# ==================================================
output "oauth_secrets_secret_arn" {
  value       = var.create_oauth_secrets ? aws_secretsmanager_secret.oauth_secrets[0].arn : data.aws_secretsmanager_secret.oauth_secrets[0].arn
  description = "ARN of OAuth secrets (auto-created if create_oauth_secrets=true, otherwise referenced)"
}

output "oauth_secrets_secret_id" {
  value       = var.create_oauth_secrets ? aws_secretsmanager_secret.oauth_secrets[0].id : data.aws_secretsmanager_secret.oauth_secrets[0].id
  description = "ID of OAuth secrets"
}
