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

output "private_alb_id" {
  description = "Private ALB ID"
  value       = try(module.private_alb.this_lb_id, module.private_alb.lb_id, "")
}

output "private_alb_arn" {
  description = "Private ALB ARN"
  value       = try(module.private_alb.this_lb_arn, module.private_alb.lb_arn, "")
}

output "private_alb_dns_name" {
  description = "Private ALB DNS name"
  value       = try(module.private_alb.dns_name, module.private_alb.this_lb_dns_name, "")
}

output "private_alb_zone_id" {
  description = "Private ALB Zone ID"
  value       = try(module.private_alb.this_lb_zone_id, module.private_alb.lb_zone_id, "")
}

output "go_server_target_group_arn" {
  description = "Go Server target group ARN (Blue/Green deployment)"
  value       = try(module.private_alb.target_groups["go-server-blue"].arn, "")
}

output "go_server_target_group_name" {
  description = "Go Server target group name (Blue/Green deployment)"
  value       = try(module.private_alb.target_groups["go-server-blue"].name, "")
}

output "go_server_blue_target_group_arn" {
  description = "Go Server Blue target group ARN (for Blue/Green deployment)"
  value       = try(module.private_alb.target_groups["go-server-blue"].arn, "")
}

output "go_server_blue_target_group_name" {
  description = "Go Server Blue target group name (for Blue/Green deployment)"
  value       = try(module.private_alb.target_groups["go-server-blue"].name, "")
}

output "go_server_green_target_group_arn" {
  description = "Go Server Green target group ARN (for Blue/Green deployment)"
  value       = try(module.private_alb.target_groups["go-server-green"].arn, "")
}

output "go_server_green_target_group_name" {
  description = "Go Server Green target group name (for Blue/Green deployment)"
  value       = try(module.private_alb.target_groups["go-server-green"].name, "")
}

output "public_alb_http_listener_arn" {
  description = "Public ALB HTTP listener ARN"
  value       = try(module.public_alb.listeners["http"].arn, "")
}

output "private_alb_http_listener_arn" {
  description = "Private ALB HTTP listener ARN"
  value       = try(module.private_alb.listeners["http"].arn, "")
}
