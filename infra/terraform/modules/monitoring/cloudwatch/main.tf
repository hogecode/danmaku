# ========================================
# CloudWatch Module - Using terraform-aws-cloudwatch module
# ========================================

module "cloudwatch_log_group_main" {
  source  = "terraform-aws-modules/cloudwatch/aws//modules/log-group"
  version = "~> 5.0"

  name              = "/ecs/${var.app_name}-${var.environment}"
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.cloudwatch_logs_kms_key_id

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-logs"
  })
}

# ========================================
# CloudWatch Alarms Module
# ========================================

module "cloudwatch_metric_alarm_health_check" {
  count   = var.route53_health_check_id != "" ? 1 : 0
  source  = "terraform-aws-modules/cloudwatch/aws//modules/metric-alarm"
  version = "~> 5.0"

  alarm_name          = "${var.app_name}-${var.environment}-endpoint-down"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  alarm_description   = "This metric monitors whether the ${var.environment} endpoint is healthy"
  alarm_actions       = length(var.healthcheck_alarm_emails) > 0 ? [aws_sns_topic.health_check_alerts[0].arn] : []

  dimensions = {
    HealthCheckId = var.route53_health_check_id
  }

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-health-check-alarm"
  })
}

# ========================================
# SNS Topics for Alerts
# ========================================

resource "aws_sns_topic" "alerts" {
  name = "${var.app_name}-${var.environment}-alerts"

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-alerts"
  })
}

resource "aws_sns_topic" "health_check_alerts" {
  count = length(var.healthcheck_alarm_emails) > 0 ? 1 : 0
  name  = "${var.app_name}-${var.environment}-health-check-alerts"

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-health-check-alerts"
  })
}

resource "aws_sns_topic_subscription" "health_check_email" {
  for_each  = toset(var.healthcheck_alarm_emails)
  topic_arn = aws_sns_topic.health_check_alerts[0].arn
  protocol  = "email"
  endpoint  = each.value
}

# ========================================
# CloudTrail (Optional)
# ========================================

resource "aws_cloudtrail" "main" {
  count          = var.enable_cloudtrail ? 1 : 0
  name           = "${var.app_name}-${var.environment}-cloudtrail"
  s3_bucket_name = var.cloudtrail_bucket_name
  is_multi_region_trail = true
  depends_on = [aws_s3_bucket_policy.cloudtrail]

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-cloudtrail"
  })
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  count  = var.enable_cloudtrail ? 1 : 0
  bucket = var.cloudtrail_bucket_name

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
        Resource = "arn:aws:s3:::${var.cloudtrail_bucket_name}"
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "arn:aws:s3:::${var.cloudtrail_bucket_name}/AWSLogs/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}
