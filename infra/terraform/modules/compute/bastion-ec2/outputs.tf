# ========================================
# Bastion EC2 Module Outputs
# ========================================

output "bastion_instance_id" {
  description = "ID of the Bastion EC2 instance"
  value       = try(aws_instance.bastion[0].id, "")
}

output "bastion_private_ip" {
  description = "Private IP address of the Bastion EC2 instance"
  value       = try(aws_instance.bastion[0].private_ip, "")
}

output "bastion_iam_role_name" {
  description = "IAM role name for Bastion EC2 instance"
  value       = aws_iam_role.bastion_role.name
}

output "bastion_iam_role_arn" {
  description = "IAM role ARN for Bastion EC2 instance"
  value       = aws_iam_role.bastion_role.arn
}

output "bastion_cloudwatch_log_group" {
  description = "CloudWatch log group name for Bastion"
  value       = try(aws_cloudwatch_log_group.bastion[0].name, "")
}

output "bastion_availability_zone" {
  description = "Availability zone of the Bastion EC2 instance"
  value       = try(aws_instance.bastion[0].availability_zone, "")
}
