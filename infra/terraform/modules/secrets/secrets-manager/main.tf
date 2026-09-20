# ========================================
# AWS Secrets Manager - Reference Existing Secrets
# ========================================
# 
# This module references secrets that are managed externally
# (via AWS Console, AWS CLI, or automated secret creation)
# 
# Secrets are expected to exist with these names:
# - {project_name}/{environment}/rds/credentials
# - {project_name}/{environment}/redis/credentials
# - {project_name}/{environment}/app/secrets
# - {project_name}/{environment}/oauth/secrets

# ==================================================
# Data Source: Reference RDS Credentials Secret
# ==================================================

data "aws_secretsmanager_secret" "rds_credentials" {
  name = "${var.project_name}/${var.environment}/rds/credentials"
}

data "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = data.aws_secretsmanager_secret.rds_credentials.id
}

# ==================================================
# Data Source: Reference Redis Credentials Secret
# ==================================================

data "aws_secretsmanager_secret" "redis_credentials" {
  name = "${var.project_name}/${var.environment}/redis/credentials"
}

data "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = data.aws_secretsmanager_secret.redis_credentials.id
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
