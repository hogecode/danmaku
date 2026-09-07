# ========================================
# CloudFront Module Outputs
# ========================================

output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront_distribution.cloudfront_distribution_id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = module.cloudfront_distribution.cloudfront_distribution_arn
}

output "distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront_distribution.cloudfront_distribution_domain_name
}

output "distribution_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = module.cloudfront_distribution.cloudfront_distribution_hosted_zone_id
}

output "distribution_status" {
  description = "CloudFront distribution status"
  value       = module.cloudfront_distribution.cloudfront_distribution_status
}
