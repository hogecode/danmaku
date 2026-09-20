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

output "nestjs_repository_url" {
  description = "Go Server ECR repository URL"
  value       = module.nestjs_ecr.repository_url
}

output "nestjs_repository_arn" {
  description = "Go Server ECR repository ARN"
  value       = module.nestjs_ecr.repository_arn
}

output "nestjs_repository_name" {
  description = "Go Server ECR repository name"
  value       = var.ecr_nestjs_repository_name
}
