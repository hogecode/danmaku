# ========================================
# Bastion EC2 - SSH Access to Private Resources
# ========================================

# Get the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ========================================
# IAM Role for Bastion EC2 Instance
# ========================================

resource "aws_iam_role" "bastion_role" {
  name_prefix = "bastion-ec2-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = merge(var.tags, {
    Name = "${var.project_name}-bastion-role-${var.environment}"
  })
}

# Attach Systems Manager policy for Session Manager access
resource "aws_iam_role_policy_attachment" "bastion_ssm_policy" {
  role       = aws_iam_role.bastion_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch policy for logging
resource "aws_iam_role_policy_attachment" "bastion_cloudwatch_policy" {
  role       = aws_iam_role.bastion_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Custom policy for ECR, Secrets Manager, and RDS access
resource "aws_iam_role_policy" "bastion_secrets_policy" {
  name_prefix = "bastion-secrets-"
  role        = aws_iam_role.bastion_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "ecr:GetAuthorizationToken"
          ]
          Resource = "*"
        },
        {
          Effect = "Allow"
          Action = [
            "rds:DescribeDBInstances",
            "rds:DescribeDBClusters",
            "rds:DescribeDBParameterGroups",
            "rds:DescribeDBSecurityGroups",
            "rds:ListTagsForResource"
          ]
          Resource = "*"
        }
      ],
      var.rds_master_password_secret_arn != "" ? [
        {
          Effect = "Allow"
          Action = [
            "secretsmanager:GetSecretValue"
          ]
          Resource = [var.rds_master_password_secret_arn]
        }
      ] : []
    )
  })
}

resource "aws_iam_instance_profile" "bastion_profile" {
  name_prefix = "bastion-ec2-profile-"
  role        = aws_iam_role.bastion_role.name
}

# ========================================
# Bastion EC2 Instance
# ========================================

resource "aws_instance" "bastion" {
  count = var.enable_bastion ? 1 : 0

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.bastion_instance_type
  iam_instance_profile   = aws_iam_instance_profile.bastion_profile.name
  subnet_id              = var.private_subnet_ids[0]
  vpc_security_group_ids = [var.bastion_security_group_id]

  # Enable monitoring
  monitoring = true

  # User data script to install necessary tools
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    aws_region        = var.aws_region
    rds_endpoint      = var.rds_endpoint
    rds_port          = var.db_engine == "postgres" ? "5432" : "3306"
    db_name           = var.rds_database_name
    db_engine         = var.db_engine
    db_engine_display = var.db_engine == "postgres" ? "PostgreSQL" : "MySQL"
  }))

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2 # Limit the number of hops for IMDS requests to prevent SSRF attacks
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.bastion_root_volume_size
    delete_on_termination = true
    encrypted             = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-bastion-${var.environment}"
  })

  lifecycle {
    ignore_changes = [ami]
  }
}

# ========================================
# CloudWatch Log Group for Bastion
# ========================================

resource "aws_cloudwatch_log_group" "bastion" {
  count = var.enable_bastion ? 1 : 0

  name              = "/ec2/${var.project_name}-bastion-${var.environment}"
  retention_in_days = var.logs_retention_days

  tags = merge(var.tags, {
    Name = "${var.project_name}-bastion-logs-${var.environment}"
  })
}

# ========================================
# Outputs
# ========================================

# Note: Outputs are defined in outputs.tf
