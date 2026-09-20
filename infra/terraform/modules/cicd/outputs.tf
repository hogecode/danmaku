# ========================================
# CI/CD Module Outputs
# ========================================

output "github_oidc_role_arn" {
  description = "ARN of the GitHub Actions OIDC IAM Role"
  value       = aws_iam_role.github_oidc_role.arn
}

output "github_oidc_role_name" {
  description = "Name of the GitHub Actions OIDC IAM Role"
  value       = aws_iam_role.github_oidc_role.name
}

output "github_oidc_role_id" {
  description = "ID of the GitHub Actions OIDC IAM Role"
  value       = aws_iam_role.github_oidc_role.id
}

output "github_oidc_provider_arn" {
  description = "ARN of the GitHub OIDC Provider"
  value       = aws_iam_openid_connect_provider.github.arn
}

