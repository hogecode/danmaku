# Security Group Module - Using terraform-aws-modules

# Terraformは複数のセキュリティグループルールを並列で作成しようとするため、
# タイミング問題が発生しやすい。具体的には、セキュリティグループA のルール作成時に
# セキュリティグループB をまだ参照できないため、以下のエラーが発生する：
# 
# Error: waiting for Security Group Rule create: couldn't find resource
# 
# この問題を解決するため、セキュリティグループ間の依存関係を明示的に
# depends_on で指定し、作成順序を制御している。
# 
# 完全な依存関係の流れ：
# alb_public_sg
#   ↓
# nextjs_sg (alb_public_sg を参照)
#   ↓
# nestjs_sg
#   ├─→ rds_sg (nestjs_sg と bastion_sg を参照)
#   └─→ redis_sg (nestjs_sg を参照)

# ALB Public Security Group
module "alb_public_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-alb-public-sg-${var.environment}"
  description = "Security group for public ALB"
  vpc_id      = var.vpc_id

  ingress_rules       = ["http-80-tcp", "https-443-tcp"]
  ingress_cidr_blocks = ["0.0.0.0/0"]

  egress_rules       = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-alb-public-sg-${var.environment}"
  }
}

# Next.js ECS Security Group
module "nextjs_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-nextjs-sg-${var.environment}"
  description = "Security group for Next.js ECS tasks"
  vpc_id      = var.vpc_id

  ingress_with_cidr_blocks = [
    {
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      cidr_blocks = "0.0.0.0/0"
      description = "HTTP from ALB"
    }
  ]
  ingress_with_source_security_group_id = [
    {
      from_port                = 3000
      to_port                  = 3000
      protocol                 = "tcp"
      source_security_group_id = module.alb_public_sg.security_group_id
      description              = "HTTP from ALB"
    }
  ]

  egress_rules       = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-nextjs-sg-${var.environment}"
  }

  depends_on = [module.alb_public_sg]
}

# Go Server ECS Security Group (NestJS)
module "nestjs_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-nestjs-sg-${var.environment}"
  description = "Security group for NestJS ECS tasks"
  vpc_id      = var.vpc_id

  ingress_with_source_security_group_id = [
    {
      from_port                = 8080
      to_port                  = 8080
      protocol                 = "tcp"
      source_security_group_id = module.alb_public_sg.security_group_id
      description              = "HTTP from Public ALB"
    }
  ]

  egress_rules       = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-nestjs-sg-${var.environment}"
  }

  depends_on = [module.alb_public_sg]
}

# RDS Security Group
module "rds_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-rds-sg-${var.environment}"
  description = "Security group for RDS database"
  vpc_id      = var.vpc_id

  ingress_rules       = []
  egress_rules        = ["all-all"]
  egress_cidr_blocks  = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-rds-sg-${var.environment}"
  }
}

# Bastion Security Group
module "bastion_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-bastion-sg-${var.environment}"
  description = "Security group for Bastion host"
  vpc_id      = var.vpc_id

  ingress_rules       = []
  egress_rules        = ["mysql-tcp", "postgresql-tcp", "https-443-tcp"]
  egress_cidr_blocks  = ["0.0.0.0/0"]
  egress_ipv6_cidr_blocks = ["::/0"]

  tags = {
    Name = "${var.project_name}-bastion-sg-${var.environment}"
  }
}

# VPC Endpoints Security Group
module "vpc_endpoints_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-vpc-endpoints-sg-${var.environment}"
  description = "Security group for VPC Endpoints"
  vpc_id      = var.vpc_id

  ingress_rules       = ["https-443-tcp"]
  ingress_cidr_blocks = [var.vpc_cidr]
  
  # Allow ingress from security groups (will be added via separate rules)
  ingress_with_source_security_group_id = []

  egress_rules        = ["all-all"]
  egress_cidr_blocks  = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-vpc-endpoints-sg-${var.environment}"
  }
}

# Redis Security Group (for future use)
module "redis_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-redis-sg-${var.environment}"
  description = "Security group for Redis cache"
  vpc_id      = var.vpc_id

  ingress_rules       = []
  egress_rules        = ["all-all"]
  egress_cidr_blocks  = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-redis-sg-${var.environment}"
  }
}

# ========================================
# Security Group Rules (Cross-SG References)
# ========================================
# これらのルールをモジュール外部で定義することで、
# セキュリティグループ間の依存関係による
# タイミング問題を回避している。

# RDS <- Nest.js
resource "aws_security_group_rule" "rds_from_nestjs_postgresql" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = module.nestjs_sg.security_group_id
  security_group_id        = module.rds_sg.security_group_id
  description              = "PostgreSQL from Nest.js"
}

resource "aws_security_group_rule" "rds_from_bastion_postgresql" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = module.bastion_sg.security_group_id
  security_group_id        = module.rds_sg.security_group_id
  description              = "PostgreSQL from Bastion"
}

# ========================================
# VPC Endpoints Security Group Rules
# ========================================
# ECS tasks need to access VPC Endpoints for ECR, Secrets Manager, CloudWatch Logs, etc.

# VPC Endpoints <- NestJS ECS
resource "aws_security_group_rule" "vpc_endpoints_from_nestjs" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = module.nestjs_sg.security_group_id
  security_group_id        = module.vpc_endpoints_sg.security_group_id
  description              = "HTTPS from Nest.js ECS for VPC Endpoints"
}

# ========================================
# Bastion Security Group Rules
# ========================================

resource "aws_security_group_rule" "bastion_egress_http" {
  type              = "egress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = module.bastion_sg.security_group_id
  description       = "HTTP egress from Bastion (for package updates)"
}

# VPC Endpoints <- Bastion (for SSM, Secrets Manager, CloudWatch Logs)
resource "aws_security_group_rule" "vpc_endpoints_from_bastion" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = module.bastion_sg.security_group_id
  security_group_id        = module.vpc_endpoints_sg.security_group_id
  description              = "HTTPS from Bastion EC2 for VPC Endpoints (SSM, ECR, Secrets Manager)"
}

# ========================================
# Redis Security Group Rules
# ========================================

# Redis <- NestJS ECS
resource "aws_security_group_rule" "redis_from_nestjs" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = module.nestjs_sg.security_group_id
  security_group_id        = module.redis_sg.security_group_id
  description              = "Redis from NestJS ECS"
}
