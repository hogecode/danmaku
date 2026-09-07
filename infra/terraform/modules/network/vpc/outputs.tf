# VPC Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "The CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "vpc_enable_dns_support" {
  description = "Whether or not the VPC has DNS support"
  value       = module.vpc.vpc_enable_dns_support
}

output "vpc_enable_dns_hostnames" {
  description = "Whether or not the VPC has DNS hostname support"
  value       = module.vpc.vpc_enable_dns_hostnames
}

# Public Subnet Outputs
output "public_subnets" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnets
}

output "public_subnet_arns" {
  description = "List of public subnet ARNs"
  value       = module.vpc.public_subnet_arns
}

output "public_route_table_ids" {
  description = "List of public route table IDs"
  value       = module.vpc.public_route_table_ids
}

# Private App Layer Subnet Outputs
output "private_app_subnets" {
  description = "List of private application layer subnet IDs"
  value       = module.vpc.private_subnets
}

output "private_app_subnet_arns" {
  description = "List of private application layer subnet ARNs"
  value       = module.vpc.private_subnet_arns
}

output "private_app_route_table_ids" {
  description = "List of private application layer route table IDs"
  value       = module.vpc.private_route_table_ids
}

# Private API Layer Subnet Outputs
output "private_api_subnets" {
  description = "List of private API layer subnet IDs"
  value       = aws_subnet.private_api[*].id
}

output "private_api_subnet_arns" {
  description = "List of private API layer subnet ARNs"
  value       = aws_subnet.private_api[*].arn
}

output "private_api_route_table_id" {
  description = "Private API layer route table ID"
  value       = aws_route_table.private_api.id
}

# Private Database Layer Subnet Outputs
output "private_db_subnets" {
  description = "List of private database layer subnet IDs"
  value       = aws_subnet.private_db[*].id
}

output "private_db_subnet_arns" {
  description = "List of private database layer subnet ARNs"
  value       = aws_subnet.private_db[*].arn
}

output "private_db_route_table_id" {
  description = "Private database layer route table ID"
  value       = aws_route_table.private_db.id
}

# NAT Gateway Outputs
output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = module.vpc.natgw_ids
}

output "nat_gateway_public_ips" {
  description = "List of public IPs assigned to NAT Gateways"
  value       = module.vpc.nat_public_ips
}

# Internet Gateway Output
output "internet_gateway_id" {
  description = "The ID of the Internet Gateway"
  value       = module.vpc.igw_id
}

# VPC Endpoints Outputs
output "vpc_endpoints" {
  description = "Map of VPC Endpoints created"
  value = {
    s3               = aws_vpc_endpoint.s3.id
    dynamodb         = aws_vpc_endpoint.dynamodb.id
    secrets_manager  = aws_vpc_endpoint.secrets_manager.id
    logs             = aws_vpc_endpoint.logs.id
    ecr_api          = aws_vpc_endpoint.ecr_api.id
    ecr_dkr          = aws_vpc_endpoint.ecr_dkr.id
    monitoring       = aws_vpc_endpoint.monitoring.id
    ssm              = aws_vpc_endpoint.ssm.id
    ssmmessages      = aws_vpc_endpoint.ssmmessages.id
    ec2messages      = aws_vpc_endpoint.ec2messages.id
    sqs              = aws_vpc_endpoint.sqs.id
  }
}

# VPC Flow Logs Output
output "vpc_flow_logs_log_group_name" {
  description = "CloudWatch Log Group name for VPC Flow Logs"
  value       = var.enable_vpc_flow_logs ? try(module.vpc.vpc_flow_logs_log_group_name, null) : null
}

output "vpc_flow_logs_iam_role_arn" {
  description = "IAM Role ARN for VPC Flow Logs"
  value       = var.enable_vpc_flow_logs ? try(module.vpc.vpc_flow_logs_iam_role_arn, null) : null
}

# Availability Zones
output "availability_zones" {
  description = "List of availability zones"
  value       = var.availability_zones
}
