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
# private_alb_sg (nextjs_sg を参照)
#   ↓
# go_server_sg (private_alb_sg を参照)
#   ├─→ rds_sg (go_server_sg と bastion_sg を参照)
#   └─→ redis_sg (go_server_sg を参照)

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

# Private ALB Security Group
module "private_alb_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-private-alb-sg-${var.environment}"
  description = "Security group for private ALB"
  vpc_id      = var.vpc_id

  ingress_rules       = ["http-8080-tcp"]
  ingress_cidr_blocks = ["0.0.0.0/0"]

  egress_rules       = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-private-alb-sg-${var.environment}"
  }
}

# Go Server ECS Security Group
module "go_server_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 5.0"

  name        = "${var.project_name}-go-server-sg-${var.environment}"
  description = "Security group for Go Server ECS tasks"
  vpc_id      = var.vpc_id

  ingress_rules       = ["http-8080-tcp"]
  ingress_cidr_blocks = ["0.0.0.0/0"]

  egress_rules       = ["all-all"]
  egress_cidr_blocks = ["0.0.0.0/0"]

  tags = {
    Name = "${var.project_name}-go-server-sg-${var.environment}"
  }
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

# Private ALB <- Next.js Security Group
resource "aws_security_group_rule" "private_alb_from_nextjs" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  source_security_group_id = module.nextjs_sg.security_group_id
  security_group_id        = module.private_alb_sg.security_group_id
  description              = "HTTP from Next.js ECS"
}

# Go Server <- Private ALB
resource "aws_security_group_rule" "go_server_from_private_alb" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  source_security_group_id = module.private_alb_sg.security_group_id
  security_group_id        = module.go_server_sg.security_group_id
  description              = "HTTP from Private ALB"
}

# RDS <- Go Server
resource "aws_security_group_rule" "rds_from_go_server_mysql" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = module.go_server_sg.security_group_id
  security_group_id        = module.rds_sg.security_group_id
  description              = "MySQL from Go Server"
}

resource "aws_security_group_rule" "rds_from_go_server_postgresql" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = module.go_server_sg.security_group_id
  security_group_id        = module.rds_sg.security_group_id
  description              = "PostgreSQL from Go Server"
}

# RDS <- Bastion
resource "aws_security_group_rule" "rds_from_bastion_mysql" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = module.bastion_sg.security_group_id
  security_group_id        = module.rds_sg.security_group_id
  description              = "MySQL from Bastion"
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

# Redis <- Go Server
resource "aws_security_group_rule" "redis_from_go_server" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = module.go_server_sg.security_group_id
  security_group_id        = module.redis_sg.security_group_id
  description              = "Redis from Go Server"
}

# ========================================
# VPC Endpoints Security Group Rules
# ========================================
# ECS tasks need to access VPC Endpoints for ECR, Secrets Manager, CloudWatch Logs, etc.

# VPC Endpoints <- Next.js ECS
resource "aws_security_group_rule" "vpc_endpoints_from_nextjs" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = module.nextjs_sg.security_group_id
  security_group_id        = module.vpc_endpoints_sg.security_group_id
  description              = "HTTPS from Next.js ECS for VPC Endpoints"
}

# VPC Endpoints <- Go Server ECS
resource "aws_security_group_rule" "vpc_endpoints_from_go_server" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = module.go_server_sg.security_group_id
  security_group_id        = module.vpc_endpoints_sg.security_group_id
  description              = "HTTPS from Go Server ECS for VPC Endpoints"
}

# ========================================
# Bastion Security Group Rules
# ========================================

# Go Server <- Bastion (for SSH tunnel or direct access)
resource "aws_security_group_rule" "go_server_from_bastion" {
  type                     = "ingress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  source_security_group_id = module.bastion_sg.security_group_id
  security_group_id        = module.go_server_sg.security_group_id
  description              = "HTTP from Bastion EC2"
}

# Next.js <- Bastion (for SSH tunnel or direct access)
resource "aws_security_group_rule" "nextjs_from_bastion" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = module.bastion_sg.security_group_id
  security_group_id        = module.nextjs_sg.security_group_id
  description              = "HTTP from Bastion EC2"
}

# Bastion egress rules to allow HTTP/HTTPS to ECS tasks
resource "aws_security_group_rule" "bastion_egress_to_go_server" {
  type                     = "egress"
  from_port                = 8080
  to_port                  = 8080
  protocol                 = "tcp"
  cidr_blocks              = ["0.0.0.0/0"]
  security_group_id        = module.bastion_sg.security_group_id
  description              = "HTTP to Go Server ECS from Bastion"
}

resource "aws_security_group_rule" "bastion_egress_to_nextjs" {
  type                     = "egress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  cidr_blocks              = ["0.0.0.0/0"]
  security_group_id        = module.bastion_sg.security_group_id
  description              = "HTTP to Next.js ECS from Bastion"
}

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
