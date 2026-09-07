output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.acm_certificate.acm_certificate_arn
}

output "vpn_server_certificate_arn" {
  description = "ARN of the VPN server ACM certificate"
  value       = module.acm_certificate_vpn.acm_certificate_arn
}
