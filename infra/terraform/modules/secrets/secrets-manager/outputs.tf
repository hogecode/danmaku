# Secrets Manager Module Outputs

# ==================================================
# Redis Credentials Secret (Auto-created)
# ==================================================
output "redis_credentials_secret_arn" {
  value       = data.aws_secretsmanager_secret.redis_credentials_existing.arn
  description = "ARN of Redis credentials secret (updated with ElastiCache endpoint)"
}

# ==================================================
# App Secrets (Must be created manually)
# ==================================================
output "app_secrets_secret_arn" {
  value       = data.aws_secretsmanager_secret.app_secrets.arn
  description = "ARN of application secrets (must be created manually)"
}

# ==================================================
# OAuth Secrets (Must be created manually)
# ==================================================
output "oauth_secrets_secret_arn" {
  value       = data.aws_secretsmanager_secret.oauth_secrets.arn
  description = "ARN of OAuth secrets (must be created manually)"
}
