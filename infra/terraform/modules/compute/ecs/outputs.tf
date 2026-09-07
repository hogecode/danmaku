# ECS Module Outputs

output "nextjs_log_group_name" {
  description = "CloudWatch Log Group name for Next.js"
  value       = aws_cloudwatch_log_group.nextjs.name
}

output "go_server_log_group_name" {
  description = "CloudWatch Log Group name for Go server"
  value       = aws_cloudwatch_log_group.go_server.name
}

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = module.ecs_cluster.cluster_id
}

output "ecs_cluster_arn" {
  description = "ECS Cluster ARN"
  value       = module.ecs_cluster.cluster_arn
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.ecs_cluster.cluster_name
}

output "ecs_task_execution_role_arn" {
  description = "ECS Task Execution Role ARN"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_nextjs_arn" {
  description = "ECS Task Role ARN for Next.js"
  value       = aws_iam_role.ecs_task_role_nextjs.arn
}

output "ecs_task_role_go_server_arn" {
  description = "ECS Task Role ARN for Go Server"
  value       = aws_iam_role.ecs_task_role_go_server.arn
}

# ========================================
# ECS Task Definition Outputs
# ========================================

output "nextjs_task_definition_arn" {
  description = "ARN of Next.js task definition"
  value       = aws_ecs_task_definition.nextjs.arn
}

output "nextjs_task_definition_family" {
  description = "Family of Next.js task definition"
  value       = aws_ecs_task_definition.nextjs.family
}

output "nextjs_task_definition_revision" {
  description = "Revision of Next.js task definition"
  value       = aws_ecs_task_definition.nextjs.revision
}

output "go_server_task_definition_arn" {
  description = "ARN of Go Server task definition"
  value       = aws_ecs_task_definition.go_server.arn
}

output "go_server_task_definition_family" {
  description = "Family of Go Server task definition"
  value       = aws_ecs_task_definition.go_server.family
}

output "go_server_task_definition_revision" {
  description = "Revision of Go Server task definition"
  value       = aws_ecs_task_definition.go_server.revision
}

# ========================================
# ECS Service Outputs
# ========================================

output "nextjs_service_name" {
  description = "Name of Next.js ECS service"
  value       = aws_ecs_service.nextjs.name
}

output "nextjs_service_cluster" {
  description = "Cluster of Next.js ECS service"
  value       = aws_ecs_service.nextjs.cluster
}

output "go_server_service_name" {
  description = "Name of Go Server ECS service"
  value       = aws_ecs_service.go_server.name
}

output "go_server_service_cluster" {
  description = "Cluster of Go Server ECS service"
  value       = aws_ecs_service.go_server.cluster
}
