# ========================================
# ALB Module Outputs
# ========================================

output "public_alb_id" {
  description = "Public ALB ID"
  value       = try(module.public_alb.this_lb_id, module.public_alb.lb_id, "")
}

output "public_alb_arn" {
  description = "Public ALB ARN"
  value       = try(module.public_alb.this_lb_arn, module.public_alb.lb_arn, "")
}

output "public_alb_dns_name" {
  description = "Public ALB DNS name"
  value       = try(module.public_alb.this_lb_dns_name, module.public_alb.lb_dns_name, "")
}

output "public_alb_zone_id" {
  description = "Public ALB Zone ID"
  value       = try(module.public_alb.this_lb_zone_id, module.public_alb.lb_zone_id, "")
}

output "nextjs_target_group_arn" {
  description = "Next.js target group ARN (Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nextjs-blue"].arn, "")
}

output "nextjs_target_group_name" {
  description = "Next.js target group name (Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nextjs-blue"].name, "")
}

output "nextjs_blue_target_group_arn" {
  description = "Next.js Blue target group ARN (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nextjs-blue"].arn, "")
}

output "nextjs_blue_target_group_name" {
  description = "Next.js Blue target group name (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nextjs-blue"].name, "")
}

output "nextjs_green_target_group_arn" {
  description = "Next.js Green target group ARN (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nextjs-green"].arn, "")
}

output "nextjs_green_target_group_name" {
  description = "Next.js Green target group name (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nextjs-green"].name, "")
}

output "target_group_arn" {
  description = "Target group ARN (alias for nextjs_blue_target_group_arn)"
  value       = try(module.public_alb.target_groups["nextjs-blue"].arn, "")
}

output "target_group_name" {
  description = "Target group name (alias for nextjs_blue_target_group_name)"
  value       = try(module.public_alb.target_groups["nextjs-blue"].name, "")
}

output "nestjs_target_group_arn" {
  description = "NestJS target group ARN (Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nestjs-blue"].arn, "")
}

output "nestjs_target_group_name" {
  description = "NestJS target group name (Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nestjs-blue"].name, "")
}

output "nestjs_blue_target_group_arn" {
  description = "NestJS Blue target group ARN (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nestjs-blue"].arn, "")
}

output "nestjs_blue_target_group_name" {
  description = "NestJS Blue target group name (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nestjs-blue"].name, "")
}

output "nestjs_green_target_group_arn" {
  description = "NestJS Green target group ARN (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nestjs-green"].arn, "")
}

output "nestjs_green_target_group_name" {
  description = "NestJS Green target group name (for Blue/Green deployment)"
  value       = try(module.public_alb.target_groups["nestjs-green"].name, "")
}

output "public_alb_http_listener_arn" {
  description = "Public ALB HTTP listener ARN"
  value       = try(module.public_alb.listeners["http"].arn, "")
}

output "public_alb_http_listener_id" {
  description = "Public ALB HTTP listener ID"
  value       = try(module.public_alb.listeners["http"].id, "")
}

output "nestjs_blue_target_group_arn_value" {
  description = "NestJS Blue target group ARN (for listener rules)"
  value       = try(module.public_alb.target_group_arns["nestjs-blue"], "")
}
