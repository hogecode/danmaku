# ALB Logs Bucket
output "alb_logs_bucket_name" {
  description = "Name of the ALB logs bucket"
  value       = module.alb_logs.s3_bucket_id
}

output "alb_logs_bucket_arn" {
  description = "ARN of the ALB logs bucket"
  value       = module.alb_logs.s3_bucket_arn
}

# CloudTrail Bucket
output "cloudtrail_bucket_name" {
  description = "Name of the CloudTrail bucket"
  value       = module.cloudtrail.s3_bucket_id
}

output "cloudtrail_bucket_arn" {
  description = "ARN of the CloudTrail bucket"
  value       = module.cloudtrail.s3_bucket_arn
}

# App Filesystem Bucket
output "app_filesystem_bucket_name" {
  description = "Name of the app filesystem bucket"
  value       = module.app_filesystem.s3_bucket_id
}

output "app_filesystem_bucket_arn" {
  description = "ARN of the app filesystem bucket"
  value       = module.app_filesystem.s3_bucket_arn
}

# AWS Config Bucket
output "config_bucket_name" {
  description = "Name of the AWS Config bucket"
  value       = module.config.s3_bucket_id
}

output "config_bucket_arn" {
  description = "ARN of the AWS Config bucket"
  value       = module.config.s3_bucket_arn
}
