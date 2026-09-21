# ========================================
# AWS Secrets Manager - Manage Secrets
# ========================================
# 
# This module creates/manages secrets in AWS Secrets Manager:
# - {project_name}/{environment}/redis/credentials (auto-created with ElastiCache endpoint)
# - {project_name}/{environment}/app/secrets (reference: must exist)
# - {project_name}/{environment}/oauth/secrets (reference: must exist)
#
# NOTE: RDS credentials are automatically managed by AWS RDS via Secrets Manager
# (when manage_master_user_password = true). This secret is NOT referenced here.
# Use module.rds.db_instance_master_user_secret_arn instead.

# ==================================================
# Create or Reference Redis Credentials Secret
# ==================================================
# This secret is auto-created if it doesn't exist
# and updated with the ElastiCache endpoint

resource "aws_secretsmanager_secret" "redis_credentials" {
  name                    = "${var.project_name}/${var.environment}/redis/credentials"
  description             = "Redis credentials for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-redis-credentials"
    }
  )
}

resource "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = aws_secretsmanager_secret.redis_credentials.id
  secret_string = jsonencode({
    host     = var.redis_endpoint != "" ? var.redis_endpoint : "redis"
    port     = var.redis_port
    password = ""
    db       = 0
  })
}

# ==================================================
# Application Secrets (Create or Reference)
# ==================================================

resource "aws_secretsmanager_secret" "app_secrets" {
  count = var.create_app_secrets ? 1 : 0

  name                    = "${var.project_name}/${var.environment}/app/secrets"
  description             = "Application secrets for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-app-secrets"
    }
  )
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  count = var.create_app_secrets ? 1 : 0

  secret_id     = aws_secretsmanager_secret.app_secrets[0].id
  secret_string = jsonencode(var.app_secrets_data)
}

data "aws_secretsmanager_secret" "app_secrets" {
  count = var.create_app_secrets ? 0 : 1
  name  = "${var.project_name}/${var.environment}/app/secrets"
}

data "aws_secretsmanager_secret_version" "app_secrets" {
  count     = var.create_app_secrets ? 0 : 1
  secret_id = data.aws_secretsmanager_secret.app_secrets[0].id
}

# ==================================================
# OAuth Secrets (Create or Reference)
# ==================================================

resource "aws_secretsmanager_secret" "oauth_secrets" {
  count = var.create_oauth_secrets ? 1 : 0

  name                    = "${var.project_name}/${var.environment}/oauth/secrets"
  description             = "OAuth secrets for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-oauth-secrets"
    }
  )
}

resource "aws_secretsmanager_secret_version" "oauth_secrets" {
  count = var.create_oauth_secrets ? 1 : 0

  secret_id     = aws_secretsmanager_secret.oauth_secrets[0].id
  secret_string = jsonencode(var.oauth_secrets_data)
}

data "aws_secretsmanager_secret" "oauth_secrets" {
  count = var.create_oauth_secrets ? 0 : 1
  name  = "${var.project_name}/${var.environment}/oauth/secrets"
}

data "aws_secretsmanager_secret_version" "oauth_secrets" {
  count     = var.create_oauth_secrets ? 0 : 1
  secret_id = data.aws_secretsmanager_secret.oauth_secrets[0].id
}
