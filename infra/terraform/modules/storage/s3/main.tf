# ========================================
# S3 Buckets using terraform-aws-modules
# ========================================

# Random suffix for bucket names to ensure uniqueness
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# ========================================
# ALB Access Logs Bucket
# ========================================
module "alb_logs" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 4.0"

  bucket = "${var.app_name}-${var.environment}-alb-logs-${random_string.bucket_suffix.result}"

  # Block all public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  # Server-side encryption
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  # Bucket policy for ALB and delivery logs
  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "logdelivery.elasticloadbalancing.amazonaws.com"
        }
        Action = "s3:PutObject"
        Resource = "${module.alb_logs.s3_bucket_arn}/alb/AWSLogs/${var.caller_identity_account_id}/*"
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "logdelivery.elasticloadbalancing.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = module.alb_logs.s3_bucket_arn
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${module.alb_logs.s3_bucket_arn}/alb/AWSLogs/${var.caller_identity_account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = module.alb_logs.s3_bucket_arn
      }
    ]
  })

  # Lifecycle policy
  lifecycle_rule = [
    {
      id     = "delete_old_logs"
      status = "Enabled"
      prefix = "alb/AWSLogs/"

      expiration = {
        days = 90
      }

      noncurrent_version_expiration = {
        noncurrent_days = 30
      }
    }
  ]

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-alb-logs"
  })
}

# ========================================
# CloudTrail Logs Bucket
# ========================================
module "cloudtrail" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 4.0"

  bucket = "${var.app_name}-${var.environment}-cloudtrail-${random_string.bucket_suffix.result}"

  # Block all public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  # Server-side encryption
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  # Bucket policy for CloudTrail
  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = module.cloudtrail.s3_bucket_arn
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudtrail:${var.aws_region}:${var.caller_identity_account_id}:trail/${var.app_name}-${var.environment}-cloudtrail"
          }
        }
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${module.cloudtrail.s3_bucket_arn}/AWSLogs/${var.caller_identity_account_id}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl"  = "bucket-owner-full-control"
            "AWS:SourceArn" = "arn:aws:cloudtrail:${var.aws_region}:${var.caller_identity_account_id}:trail/${var.app_name}-${var.environment}-cloudtrail"
          }
        }
      }
    ]
  })

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-cloudtrail"
  })
}

# ========================================
# Application Filesystem Bucket
# ========================================
module "app_filesystem" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 4.0"

  bucket = "${var.app_name}-${var.environment}-filesystem-${random_string.bucket_suffix.result}"

  # Block all public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  # Versioning
  versioning = {
    status = "Enabled"
  }

  # Server-side encryption with KMS
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm     = "aws:kms"
        kms_master_key_id = var.s3_filesystem_kms_key_arn
      }
      bucket_key_enabled = true
    }
  }

  # CORS configuration
  cors_rule = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
      allowed_origins = [
        "https://*.${var.domain_name}",
        "https://${var.domain_name}"
      ]
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]

  # Lifecycle policy
  lifecycle_rule = [
    {
      id     = "cleanup_old_versions"
      status = "Enabled"

      noncurrent_version_expiration = {
        noncurrent_days = 30
      }

      abort_incomplete_multipart_upload = {
        days_after_initiation = 1
      }
    }
  ]

  # Bucket policy for Macie
  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowMacieToGetObjects"
        Effect = "Allow"
        Principal = {
          Service = "macie.amazonaws.com"
        }
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = "${module.app_filesystem.s3_bucket_arn}/*"
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      },
      {
        Sid    = "AllowMacieToGetBucketInfo"
        Effect = "Allow"
        Principal = {
          Service = "macie.amazonaws.com"
        }
        Action = [
          "s3:GetBucketLocation",
          "s3:GetBucketVersioning",
          "s3:ListBucket"
        ]
        Resource = module.app_filesystem.s3_bucket_arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      }
    ]
  })

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-filesystem"
  })
}

# ========================================
# AWS Config Bucket
# ========================================
module "config" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 4.0"

  bucket = "${var.app_name}-${var.environment}-config-${random_string.bucket_suffix.result}"

  # Block all public access
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  # Versioning
  versioning = {
    status = "Enabled"
  }

  # Server-side encryption
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  # Lifecycle policy
  lifecycle_rule = [
    {
      id     = "delete_old_config_data"
      status = "Enabled"
      prefix = "AWSLogs/"

      expiration = {
        days = 365
      }

      noncurrent_version_expiration = {
        noncurrent_days = 90
      }

      abort_incomplete_multipart_upload = {
        days_after_initiation = 1
      }
    }
  ]

  # Bucket policy for Config and Backup
  attach_policy = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSConfigBucketPermissionsCheck"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = module.config.s3_bucket_arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      },
      {
        Sid    = "AWSConfigBucketExistenceCheck"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:ListBucket"
        Resource = module.config.s3_bucket_arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      },
      {
        Sid    = "AWSConfigBucketWrite"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${module.config.s3_bucket_arn}/AWSLogs/${var.caller_identity_account_id}/Config/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl"      = "bucket-owner-full-control"
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      },
      {
        Sid    = "AWSBackupReportWrite"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${module.config.s3_bucket_arn}/backup-reports/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl"      = "bucket-owner-full-control"
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      },
      {
        Sid    = "AWSBackupReportRead"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
        Action = [
          "s3:GetBucketAcl",
          "s3:GetBucketLocation"
        ]
        Resource = module.config.s3_bucket_arn
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = var.caller_identity_account_id
          }
        }
      }
    ]
  })

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-config"
  })
}


