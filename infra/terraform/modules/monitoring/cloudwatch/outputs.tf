# ========================================
# CloudWatch Module Outputs
# ========================================

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = try(module.cloudwatch_log_group_main.this_log_group_name, module.cloudwatch_log_group_main.name, "")
}

output "log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = try(module.cloudwatch_log_group_main.this_log_group_arn, module.cloudwatch_log_group_main.arn, "")
}

output "alerts_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "health_check_alerts_topic_arn" {
  description = "SNS topic ARN for health check alerts"
  value       = length(aws_sns_topic.health_check_alerts) > 0 ? aws_sns_topic.health_check_alerts[0].arn : null
}
