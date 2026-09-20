output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.acm_certificate.acm_certificate_arn
}


