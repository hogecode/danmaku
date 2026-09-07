# ========================================
# CI/CD Module Outputs
# ========================================

output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = aws_codepipeline.pipeline.name
}

output "codepipeline_arn" {
  description = "ARN of the CodePipeline"
  value       = aws_codepipeline.pipeline.arn
}

output "codebuild_build_project_name" {
  description = "Name of the CodeBuild build project"
  value       = aws_codebuild_project.build_project.name
}

output "codebuild_build_project_arn" {
  description = "ARN of the CodeBuild build project"
  value       = aws_codebuild_project.build_project.arn
}

output "codebuild_scan_project_name" {
  description = "Name of the CodeBuild scan project"
  value       = aws_codebuild_project.scan_project.name
}

output "codebuild_scan_project_arn" {
  description = "ARN of the CodeBuild scan project"
  value       = aws_codebuild_project.scan_project.arn
}

output "codedeploy_app_name" {
  description = "Name of the CodeDeploy application"
  value       = aws_codedeploy_app.app.name
}

output "codedeploy_nextjs_deployment_group_name" {
  description = "Name of the Next.js CodeDeploy deployment group"
  value       = try(aws_codedeploy_deployment_group.nextjs_deployment_group[0].deployment_group_name, "")
}

output "codedeploy_nextjs_deployment_group_arn" {
  description = "ARN of the Next.js CodeDeploy deployment group"
  value       = try(aws_codedeploy_deployment_group.nextjs_deployment_group[0].arn, "")
}

output "codedeploy_nextjs_deployment_group_id" {
  description = "ID of the Next.js CodeDeploy deployment group"
  value       = try(aws_codedeploy_deployment_group.nextjs_deployment_group[0].deployment_group_id, "")
}

output "codedeploy_go_deployment_group_name" {
  description = "Name of the Go Server CodeDeploy deployment group"
  value       = try(aws_codedeploy_deployment_group.go_deployment_group[0].deployment_group_name, "")
}

output "codedeploy_go_deployment_group_arn" {
  description = "ARN of the Go Server CodeDeploy deployment group"
  value       = try(aws_codedeploy_deployment_group.go_deployment_group[0].arn, "")
}

output "codedeploy_go_deployment_group_id" {
  description = "ID of the Go Server CodeDeploy deployment group"
  value       = try(aws_codedeploy_deployment_group.go_deployment_group[0].deployment_group_id, "")
}

output "codebuild_role_arn" {
  description = "ARN of the CodeBuild service role"
  value       = aws_iam_role.codebuild_role.arn
}

output "codepipeline_role_arn" {
  description = "ARN of the CodePipeline service role"
  value       = aws_iam_role.codepipeline_role.arn
}

output "codedeploy_role_arn" {
  description = "ARN of the CodeDeploy service role"
  value       = aws_iam_role.codedeploy_role.arn
}

output "codebuild_build_log_group_name" {
  description = "CloudWatch Logs group name for CodeBuild build project"
  value       = aws_cloudwatch_log_group.codebuild_build_log.name
}

output "codebuild_scan_log_group_name" {
  description = "CloudWatch Logs group name for CodeBuild scan project"
  value       = aws_cloudwatch_log_group.codebuild_scan_log.name
}
