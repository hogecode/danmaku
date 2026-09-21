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
# Data Source: Reference Redis Credentials Secret
# ==================================================
# NOTE: The secret must exist. If deleted, restore it first:
# aws secretsmanager restore-secret --secret-id ${project_name}/${environment}/redis/credentials

data "aws_secretsmanager_secret" "redis_credentials_existing" {
  name = "${var.project_name}/${var.environment}/redis/credentials"
}

# ==================================================
# Update Redis Credentials Secret with ElastiCache endpoint
# ==================================================

resource "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = data.aws_secretsmanager_secret.redis_credentials_existing.id
  secret_string = jsonencode({
    host     = var.redis_endpoint != "" ? var.redis_endpoint : "redis"
    port     = var.redis_port
    password = ""
    db       = 0
  })
}

# ==================================================
# Data Source: Reference Application Secrets
# ==================================================

data "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}/${var.environment}/app/secrets"
}

data "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id
}

# ==================================================
# Data Source: Reference OAuth Secrets
# ==================================================

data "aws_secretsmanager_secret" "oauth_secrets" {
  name = "${var.project_name}/${var.environment}/oauth/secrets"
}

data "aws_secretsmanager_secret_version" "oauth_secrets" {
  secret_id = data.aws_secretsmanager_secret.oauth_secrets.id
}
