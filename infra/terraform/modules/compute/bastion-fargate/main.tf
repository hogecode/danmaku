# ========================================
# Bastion Fargate - CloudWatch Logs
# ========================================

resource "aws_cloudwatch_log_group" "bastion" {
  name              = "/ecs/${var.project_name}-bastion-${var.environment}"
  retention_in_days = var.logs_retention_days

  tags = merge(var.tags, {
    Name = "${var.project_name}-bastion-logs-${var.environment}"
  })
}

# ========================================
# IAM Task Execution Role (for ECR, CloudWatch, Secrets Manager)
# ========================================

resource "aws_iam_role" "bastion_task_execution_role" {
  name_prefix = "bastion-task-execution-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "bastion_task_execution_role_policy" {
  role       = aws_iam_role.bastion_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "bastion_task_execution_custom" {
  name_prefix = "bastion-execution-custom-"
  role        = aws_iam_role.bastion_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "ecr:GetAuthorizationToken",
            "ecr:BatchGetImage",
            "ecr:GetDownloadUrlForLayer"
          ]
          Resource = "*"
        },
        {
          Effect = "Allow"
          Action = [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Resource = "${aws_cloudwatch_log_group.bastion.arn}:*"
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

# ========================================
# IAM Task Role (for SSM, RDS, Secrets Manager)
# ========================================

resource "aws_iam_role" "bastion_task_role" {
  name_prefix = "bastion-task-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "bastion_ssm_policy" {
  name_prefix = "bastion-ssm-"
  role        = aws_iam_role.bastion_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [
        {
          Effect = "Allow"
          Action = [
            "ssmmessages:CreateControlChannel",
            "ssmmessages:CreateDataChannel",
            "ssmmessages:OpenControlChannel",
            "ssmmessages:OpenDataChannel"
          ]
          Resource = "*"
        },
        {
          Effect = "Allow"
          Action = [
            "ec2messages:GetMessages"
          ]
          Resource = "*"
        },
        {
          Effect = "Allow"
          Action = [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Resource = "${aws_cloudwatch_log_group.bastion.arn}:*"
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

# ========================================
# ECS Task Definition
# ========================================

resource "aws_ecs_task_definition" "bastion" {
  count = var.bastion_image_uri != "" ? 1 : 0

  family                   = "${var.project_name}-bastion-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.container_cpu
  memory                   = var.container_memory
  execution_role_arn       = aws_iam_role.bastion_task_execution_role.arn
  task_role_arn            = aws_iam_role.bastion_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-bastion"
      image     = var.bastion_image_uri
      essential = true

      portMappings = []

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.bastion.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "RDS_ENDPOINT"
          value = var.rds_endpoint
        },
        {
          name  = "RDS_MASTER_USERNAME"
          value = var.rds_master_username
        },
        {
          name  = "RDS_MASTER_PASSWORD_SECRET_ARN"
          value = var.rds_master_password_secret_arn
        },
        {
          name  = "RDS_DATABASE_NAME"
          value = var.rds_database_name
        },
        {
          name  = "APP_DB_USERNAME"
          value = var.app_db_username
        },
        {
          name  = "DB_ENGINE"
          value = var.db_engine
        }
      ]

      secrets = var.app_db_password != "" ? [
        {
          name      = "APP_DB_PASSWORD"
          valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/bastion/app_db_password"
        },
        {
          name      = "DB_READ_ONLY_PASSWORD"
          valueFrom = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/bastion/readonly_password"
        }
      ] : []
    }
  ])

  tags = merge(var.tags, {
    Name = "${var.project_name}-bastion-${var.environment}"
  })
}

# ========================================
# ECS Service
# ========================================

resource "aws_ecs_service" "bastion" {
  count = var.bastion_image_uri != "" ? 1 : 0

  name            = "${var.project_name}-bastion-${var.environment}"
  cluster         = var.ecs_cluster_name
  task_definition = aws_ecs_task_definition.bastion[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.bastion_security_group_id]
    assign_public_ip = false
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-bastion-service-${var.environment}"
  })

  depends_on = [aws_iam_role.bastion_task_role, aws_iam_role.bastion_task_execution_role]
}

data "aws_caller_identity" "current" {}
