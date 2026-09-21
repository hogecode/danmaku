# ECS Module - Using terraform-aws-modules

# ========================================
# ECR Repositories are managed in terraform/modules/compute/ecr/
# ========================================
# Note: ECR repositories are centrally managed in the ecr module
# to avoid duplication and keep separation of concerns clear.

# ========================================
# CloudWatch Log Groups
# ========================================

resource "aws_cloudwatch_log_group" "nextjs" {
  name              = "/ecs/${var.project_name}-nextjs-${var.environment}"
  retention_in_days = var.logs_retention_days
  tags = {
    Name = "${var.project_name}-nextjs-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "nestjs" {
  name              = "/ecs/${var.project_name}-nestjs-${var.environment}"
  retention_in_days = var.logs_retention_days
  tags = {
    Name = "${var.project_name}-nestjs-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "xray" {
  name              = "/ecs/${var.project_name}-xray-${var.environment}"
  retention_in_days = var.logs_retention_days
  tags = {
    Name = "${var.project_name}-xray-logs-${var.environment}"
  }
}

# ========================================
# Service Discovery - CloudMap Namespace
# ========================================

resource "aws_service_discovery_private_dns_namespace" "ecs" {
  name            = "${var.project_name}.local"
  vpc             = var.vpc_id
  description     = "Private DNS namespace for ECS Service Discovery (${var.environment})"

  tags = {
    Name = "${var.project_name}-dns-namespace-${var.environment}"
  }
}

# ========================================
# ECS Cluster (using terraform-aws-modules)
# ========================================

module "ecs_cluster" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "~> 5.0"

  cluster_name = "${var.project_name}-cluster-${var.environment}"

  # Container Insights
  cluster_settings = {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  tags = {
    Name = "${var.project_name}-cluster-${var.environment}"
  }
}

# ========================================
# IAM Roles for ECS
# ========================================

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-task-execution-role-${var.environment}"

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

  tags = {
    Name = "${var.project_name}-ecs-task-execution-role-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_custom" {
  name = "${var.project_name}-ecs-task-execution-custom-${var.environment}"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken", "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/ecs/*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/*",
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:rds!*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = "*"
      }
    ]
  })
}

# Next.js Task Role
resource "aws_iam_role" "ecs_task_role_nextjs" {
  name = "${var.project_name}-ecs-task-role-nextjs-${var.environment}"

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

  tags = {
    Name = "${var.project_name}-ecs-task-role-nextjs-${var.environment}"
  }
}

resource "aws_iam_role_policy" "ecs_task_role_nextjs" {
  name = "${var.project_name}-ecs-task-role-nextjs-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role_nextjs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:PutLogEvents"]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/ecs/${var.project_name}-nextjs-*"
      },
      {
        Effect   = "Allow"
        Action   = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["cloudwatch:PutMetricData"]
        Resource = "*"
      }
    ]
  })
}

# Go Server Task Role
resource "aws_iam_role" "ecs_task_role_nestjs" {
  name = "${var.project_name}-ecs-task-role-nestjs-${var.environment}"

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

  tags = {
    Name = "${var.project_name}-ecs-task-role-nestjs-${var.environment}"
  }
}

resource "aws_iam_role_policy" "ecs_task_role_nestjs" {
  name = "${var.project_name}-ecs-task-role-nestjs-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role_nestjs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:PutLogEvents"]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/ecs/${var.project_name}-nestjs-*"
      },
      {
        Effect   = "Allow"
        Action   = ["xray:PutTraceSegments", "xray:PutTelemetryRecords"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/*",
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:rds!*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["rds:DescribeDBInstances", "rds-db:connect"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["cloudwatch:PutMetricData", "kms:Decrypt"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ssmmessages:CreateControlChannel", "ssmmessages:CreateDataChannel", "ssmmessages:OpenControlChannel", "ssmmessages:OpenDataChannel"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2messages:GetMessages"]
        Resource = "*"
      }
    ]
  })
}

# ========================================
# ECS Task Definitions
# ========================================

# Next.js Task Definition
resource "aws_ecs_task_definition" "nextjs" {
  family                   = "${var.project_name}-nextjs"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.nextjs_task_cpu
  memory                   = var.nextjs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role_nextjs.arn

  container_definitions = jsonencode([
    {
      name                 = "${var.project_name}-nextjs"
      image                = "${var.ecr_nextjs_repository_url}:${var.nextjs_image_tag}"
      essential            = true
      enableExecuteCommand = true
      portMappings = [
        {
          containerPort = var.nextjs_container_port
          hostPort      = var.nextjs_container_port
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.nextjs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      environment = var.nextjs_environment_variables
      secrets = var.nextjs_secrets
    }
  ])

  tags = {
    Name = "${var.project_name}-nextjs-task-${var.environment}"
  }
}

# NestJS Task Definition
resource "aws_ecs_task_definition" "nestjs" {
  family                   = "${var.project_name}-nestjs"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.nestjs_task_cpu
  memory                   = var.nestjs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role_nestjs.arn

  container_definitions = jsonencode([
    {
      name                 = "${var.project_name}-nestjs"
      image                = "${var.ecr_nestjs_repository_url}:${var.nestjs_image_tag}"
      essential            = true
      enableExecuteCommand = true
      portMappings = [
        {
          containerPort = var.nestjs_container_port
          hostPort      = var.nestjs_container_port
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.nestjs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      environment = concat(
        var.nestjs_environment_variables,
        var.rds_endpoint != "" ? [
          {
            name  = "DB_HOST"
            value = var.rds_endpoint
          },
          {
            name  = "DB_PORT"
            value = tostring(var.rds_port)
          },
          {
            name  = "DB_NAME"
            value = var.rds_database_name
          },
          {
            name  = "DB_ENGINE"
            value = var.rds_engine
          }
        ] : [],
        var.rds_master_user_secret_arn != "" ? [
          {
            name  = "DB_CREDENTIALS_SECRET_ARN"
            value = var.rds_master_user_secret_arn
          }
        ] : []
      )
      secrets = concat(
        var.nestjs_secrets,
        var.rds_master_user_secret_arn != "" ? [
          {
            name      = "DB_CREDENTIALS"
            valueFrom = var.rds_master_user_secret_arn
          }
        ] : [],
        var.redis_credentials_secret_arn != "" ? [
          {
            name      = "REDIS_CREDENTIALS"
            valueFrom = var.redis_credentials_secret_arn
          }
        ] : [],
        var.app_secrets_secret_arn != "" ? [
          {
            name      = "APP_SECRETS"
            valueFrom = var.app_secrets_secret_arn
          }
        ] : [],
        var.oauth_secrets_secret_arn != "" ? [
          {
            name      = "OAUTH_SECRETS"
            valueFrom = var.oauth_secrets_secret_arn
          }
        ] : []
      )
    }
  ])

  tags = {
    Name = "${var.project_name}-nestjs-task-${var.environment}"
  }
}

# ========================================
# ECS Services
# ========================================

# Next.js Service
resource "aws_ecs_service" "nextjs" {
  name            = "${var.project_name}-nextjs-service"
  cluster         = module.ecs_cluster.cluster_id
  task_definition = aws_ecs_task_definition.nextjs.arn
  desired_count   = var.nextjs_desired_count
  launch_type     = "FARGATE"
  enable_execute_command = true

  network_configuration {
    subnets          = var.private_app_subnet_ids
    security_groups  = [var.nextjs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.nextjs_target_group_arn
    container_name   = "${var.project_name}-nextjs"
    container_port   = var.nextjs_container_port
  }

  depends_on = [
    aws_iam_role_policy.ecs_task_execution_custom,
    aws_iam_role_policy.ecs_task_role_nextjs
  ]

  deployment_controller {
    type = "ECS"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  tags = {
    Name = "${var.project_name}-nextjs-service-${var.environment}"
  }
}

# ========================================
# CloudMap Service Registration - NestJS
# ========================================

resource "aws_service_discovery_service" "nestjs" {
  name            = "nestjs-service"
  namespace_id    = aws_service_discovery_private_dns_namespace.ecs.id
  description     = "Service discovery for NestJS API service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.ecs.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  # Note: Health check config is not supported with private DNS namespaces
  # ECS will automatically register/deregister instances based on task status

  tags = {
    Name = "${var.project_name}-nestjs-sd-service-${var.environment}"
  }
}

# NestJS Service
resource "aws_ecs_service" "nestjs" {
  name            = "${var.project_name}-nestjs-service"
  cluster         = module.ecs_cluster.cluster_id
  task_definition = aws_ecs_task_definition.nestjs.arn
  desired_count   = var.nestjs_desired_count
  launch_type     = "FARGATE"
  enable_execute_command = true

  network_configuration {
    subnets          = var.private_api_subnet_ids
    security_groups  = [var.nestjs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.nestjs_target_group_arn
    container_name   = "${var.project_name}-nestjs"
    container_port   = var.nestjs_container_port
  }

  # Service Discovery - CloudMap Registration
  service_registries {
    registry_arn = aws_service_discovery_service.nestjs.arn
  }

  deployment_controller {
    type = "ECS"
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [
    aws_iam_role_policy.ecs_task_execution_custom,
    aws_iam_role_policy.ecs_task_role_nestjs,
    aws_service_discovery_service.nestjs
  ]

  tags = {
    Name = "${var.project_name}-nestjs-service-${var.environment}"
  }
}
