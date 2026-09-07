# ========================================
# Route53 Module Outputs
# ========================================

output "route53_records" {
  description = "Route53 records created"
  value       = module.route53_records.records
}

output "health_check_id" {
  description = "Route53 health check ID"
  value       = aws_route53_health_check.main.id
}

output "health_check_arn" {
  description = "Route53 health check ARN"
  value       = aws_route53_health_check.main.arn
}
