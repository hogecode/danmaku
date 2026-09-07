# ========================================
# ECR Module Outputs
# ========================================

output "nextjs_repository_url" {
  description = "Next.js ECR repository URL"
  value       = module.nextjs_ecr.repository_url
}

output "nextjs_repository_arn" {
  description = "Next.js ECR repository ARN"
  value       = module.nextjs_ecr.repository_arn
}

output "nextjs_repository_name" {
  description = "Next.js ECR repository name"
  value       = var.ecr_nextjs_repository_name
}

output "go_server_repository_url" {
  description = "Go Server ECR repository URL"
  value       = module.go_server_ecr.repository_url
}

output "go_server_repository_arn" {
  description = "Go Server ECR repository ARN"
  value       = module.go_server_ecr.repository_arn
}

output "go_server_repository_name" {
  description = "Go Server ECR repository name"
  value       = var.ecr_go_server_repository_name
}
