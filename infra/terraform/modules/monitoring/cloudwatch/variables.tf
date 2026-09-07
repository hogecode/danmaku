# ========================================
# CloudWatch Module Variables
# ========================================

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "logs_retention_days" {
  description = "CloudWatch logs retention in days"
  type        = number
  default     = 30
}

variable "cloudwatch_logs_kms_key_id" {
  description = "CloudWatch logs KMS key ID"
  type        = string
  default     = ""
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "healthcheck_alarm_emails" {
  description = "Email addresses for health check alarms"
  type        = list(string)
  default     = []
}

variable "route53_health_check_id" {
  description = "Route53 health check ID"
  type        = string
  default     = ""
}

variable "enable_cloudtrail" {
  description = "Enable CloudTrail"
  type        = bool
  default     = false
}

variable "cloudtrail_bucket_name" {
  description = "S3 bucket name for CloudTrail logs"
  type        = string
  default     = ""
}
