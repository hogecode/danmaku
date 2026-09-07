# VPC Module using terraform-aws-modules
# https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  public_subnets = var.public_subnet_cidrs

  # Private subnets - Application Layer
  private_subnets = var.private_app_subnet_cidrs

  # Additional private subnets for different layers
  # This is handled separately since terraform-aws-modules VPC doesn't support multiple private subnet groups directly

  enable_nat_gateway   = var.enable_nat_gateway
  single_nat_gateway   = var.nat_gateway_count == 1 ? true : false
  one_nat_gateway_per_az = var.nat_gateway_count == 2 ? true : false

  enable_dns_hostnames = true
  enable_dns_support   = true

  # VPC Flow Logs
  enable_flow_log                      = var.enable_vpc_flow_logs
  create_flow_log_cloudwatch_iam_role  = var.enable_vpc_flow_logs
  create_flow_log_cloudwatch_log_group = var.enable_vpc_flow_logs
  flow_log_cloudwatch_log_group_retention_in_days = var.enable_vpc_flow_logs ? 7 : null

  # Tags
  tags = {
    Name = "${var.project_name}-vpc-${var.environment}"
  }
}

# Additional private subnets for API Layer (Go Server, ALB, Bastion)
resource "aws_subnet" "private_api" {
  count = length(var.private_api_subnet_cidrs)

  vpc_id            = module.vpc.vpc_id
  cidr_block        = var.private_api_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index % length(var.availability_zones)]

  tags = {
    Name = "${var.project_name}-private-api-${var.availability_zones[count.index % length(var.availability_zones)]}"
    Type = "API"
  }
}

# Additional private subnets for Data Layer (RDS)
resource "aws_subnet" "private_db" {
  count = length(var.private_db_subnet_cidrs)

  vpc_id            = module.vpc.vpc_id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index % length(var.availability_zones)]

  tags = {
    Name = "${var.project_name}-private-db-${var.availability_zones[count.index % length(var.availability_zones)]}"
    Type = "Database"
  }
}

# Route table for API Layer private subnets
resource "aws_route_table" "private_api" {
  vpc_id = module.vpc.vpc_id

  tags = {
    Name = "${var.project_name}-private-api-rt-${var.environment}"
  }
}

# Route table for Data Layer private subnets
resource "aws_route_table" "private_db" {
  vpc_id = module.vpc.vpc_id

  tags = {
    Name = "${var.project_name}-private-db-rt-${var.environment}"
  }
}

# Associate API Layer subnets with route table
resource "aws_route_table_association" "private_api" {
  count = length(aws_subnet.private_api)

  subnet_id      = aws_subnet.private_api[count.index].id
  route_table_id = aws_route_table.private_api.id
}

# Associate Data Layer subnets with route table
resource "aws_route_table_association" "private_db" {
  count = length(aws_subnet.private_db)

  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private_db.id
}

# Routes for API Layer - via NAT Gateway
resource "aws_route" "private_api_nat" {
  count = var.enable_nat_gateway ? 1 : 0

  route_table_id         = aws_route_table.private_api.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = module.vpc.natgw_ids[0]

  depends_on = [module.vpc]
}

# Routes for Data Layer - via NAT Gateway
resource "aws_route" "private_db_nat" {
  count = var.enable_nat_gateway ? 1 : 0

  route_table_id         = aws_route_table.private_db.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = module.vpc.natgw_ids[0]

  depends_on = [module.vpc]
}

# VPC Endpoints for AWS Services (to avoid NAT Gateway costs)

# S3 Gateway Endpoint
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = concat(
    module.vpc.private_route_table_ids,
    [aws_route_table.private_api.id, aws_route_table.private_db.id]
  )

  tags = {
    Name = "${var.project_name}-s3-endpoint-${var.environment}"
  }
}

# DynamoDB Gateway Endpoint (for Terraform lock table)
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.aws_region}.dynamodb"
  vpc_endpoint_type = "Gateway"

  route_table_ids = concat(
    module.vpc.private_route_table_ids,
    [aws_route_table.private_api.id, aws_route_table.private_db.id]
  )

  tags = {
    Name = "${var.project_name}-dynamodb-endpoint-${var.environment}"
  }
}

# Interface Endpoint for Secrets Manager
resource "aws_vpc_endpoint" "secrets_manager" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = aws_subnet.private_api[*].id
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  tags = {
    Name = "${var.project_name}-secretsmanager-endpoint-${var.environment}"
  }
}

# Interface Endpoint for CloudWatch Logs
resource "aws_vpc_endpoint" "logs" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.logs"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:CreateLogGroup"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-logs-endpoint-${var.environment}"
  }
}

# Interface Endpoint for ECR API
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:BatchCheckLayerAvailability"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecr-api-endpoint-${var.environment}"
  }
}

# Interface Endpoint for ECR DKR (Docker)
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-ecr-dkr-endpoint-${var.environment}"
  }
}

# Default Security Group for VPC Endpoints (if not provided)
resource "aws_security_group" "vpc_endpoints_default" {
  count = var.vpc_endpoints_security_group_id == "" ? 1 : 0
  
  name        = "${var.project_name}-vpc-endpoints-default-sg-${var.environment}"
  description = "Default Security group for VPC Endpoints"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "HTTPS from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-vpc-endpoints-default-sg-${var.environment}"
  }
}

# Interface Endpoint for CloudWatch
resource "aws_vpc_endpoint" "monitoring" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.monitoring"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  tags = {
    Name = "${var.project_name}-monitoring-endpoint-${var.environment}"
  }
}

# Interface Endpoint for SSM
resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.ssm"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  tags = {
    Name = "${var.project_name}-ssm-endpoint-${var.environment}"
  }
}

# Interface Endpoint for SSM Messages
resource "aws_vpc_endpoint" "ssmmessages" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.ssmmessages"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  tags = {
    Name = "${var.project_name}-ssmmessages-endpoint-${var.environment}"
  }
}

# Interface Endpoint for EC2 Messages
resource "aws_vpc_endpoint" "ec2messages" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.ec2messages"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))
  security_group_ids = [var.vpc_endpoints_security_group_id != "" ? var.vpc_endpoints_security_group_id : aws_security_group.vpc_endpoints_default[0].id]

  tags = {
    Name = "${var.project_name}-ec2messages-endpoint-${var.environment}"
  }
}

# Interface Endpoint for SQS
resource "aws_vpc_endpoint" "sqs" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.${var.aws_region}.sqs"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  subnet_ids = slice(module.vpc.private_subnets, 0, length(var.availability_zones))

  tags = {
    Name = "${var.project_name}-sqs-endpoint-${var.environment}"
  }
}

# Update VPC Endpoints with security group (only if security group ID is provided)
resource "aws_vpc_endpoint_security_group_association" "secrets_manager" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.secrets_manager.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "logs" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.logs.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "ecr_api" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.ecr_api.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "ecr_dkr" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.ecr_dkr.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "monitoring" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.monitoring.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "ssm" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.ssm.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "ssmmessages" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.ssmmessages.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "ec2messages" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.ec2messages.id
  security_group_id = var.vpc_endpoints_security_group_id
}

resource "aws_vpc_endpoint_security_group_association" "sqs" {
  count             = var.vpc_endpoints_security_group_id != "" ? 1 : 0
  vpc_endpoint_id   = aws_vpc_endpoint.sqs.id
  security_group_id = var.vpc_endpoints_security_group_id
}