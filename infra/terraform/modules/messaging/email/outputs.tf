output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = length(aws_ses_domain_identity.test_domains) > 0 ? aws_ses_domain_identity.test_domains[0].arn : null
}

output "ses_configuration_set_arn" {
  description = "ARN of the SES configuration set"
  value       = null
}
