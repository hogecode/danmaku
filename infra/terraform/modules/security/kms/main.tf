# ========================================
# KMS Module - Centralized Key Management
# ========================================

# ========================================
# CloudWatch Logs KMS Key
# ========================================

resource "aws_kms_key" "cloudwatch_logs" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for CloudWatch Logs encryption in ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window_days
  enable_key_rotation     = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-cloudwatch-logs-key-${var.environment}"
  })
}

resource "aws_kms_alias" "cloudwatch_logs" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${var.project_name}-cloudwatch-logs-${var.environment}"
  target_key_id = aws_kms_key.cloudwatch_logs[0].key_id
}

# ========================================
# RDS KMS Key
# ========================================

resource "aws_kms_key" "rds" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for RDS encryption in ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window_days
  enable_key_rotation     = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-rds-key-${var.environment}"
  })
}

resource "aws_kms_alias" "rds" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${var.project_name}-rds-${var.environment}"
  target_key_id = aws_kms_key.rds[0].key_id
}

# ========================================
# S3 KMS Key
# ========================================

resource "aws_kms_key" "s3" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for S3 encryption in ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window_days
  enable_key_rotation     = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-s3-key-${var.environment}"
  })
}

resource "aws_kms_alias" "s3" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${var.project_name}-s3-${var.environment}"
  target_key_id = aws_kms_key.s3[0].key_id
}

# ========================================
# SQS KMS Key
# ========================================

resource "aws_kms_key" "sqs" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for SQS encryption in ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window_days
  enable_key_rotation     = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-sqs-key-${var.environment}"
  })
}

resource "aws_kms_alias" "sqs" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${var.project_name}-sqs-${var.environment}"
  target_key_id = aws_kms_key.sqs[0].key_id
}

# ========================================
# Secrets Manager KMS Key
# ========================================

resource "aws_kms_key" "secrets_manager" {
  count = var.enable_kms_encryption ? 1 : 0

  description             = "KMS key for Secrets Manager encryption in ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window_days
  enable_key_rotation     = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-secrets-manager-key-${var.environment}"
  })
}

resource "aws_kms_alias" "secrets_manager" {
  count = var.enable_kms_encryption ? 1 : 0

  name          = "alias/${var.project_name}-secrets-manager-${var.environment}"
  target_key_id = aws_kms_key.secrets_manager[0].key_id
}
