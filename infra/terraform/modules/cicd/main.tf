# ========================================
# CI/CD Module - CodeBuild, CodeDeploy, CodePipeline
# ========================================

locals {
  project_env = "${var.project_name}-${var.environment}"

  codebuild_build_project = "${local.project_env}-build"
  codebuild_scan_project  = "${local.project_env}-scan"
  codepipeline_name       = "${local.project_env}-pipeline"
  codedeploy_app_name     = "${local.project_env}-app"
  codedeploy_group_name   = "${local.project_env}-deployment-group"
}

# ========================================
# IAM Roles for CodeBuild, CodeDeploy, CodePipeline
# ========================================

# CodeBuild Service Role
resource "aws_iam_role" "codebuild_role" {
  name_prefix = "codebuild-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy" "codebuild_policy" {
  name_prefix = "codebuild-policy-"
  role        = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
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
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:BatchCheckLayerAvailability" # この権限がないと403エラーでdocker pushが失敗する
        ]
        Resource = [
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${var.ecr_nextjs_repository_name}",
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${var.ecr_nextjs_repository_name}/*",
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${var.ecr_go_server_repository_name}",
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${var.ecr_go_server_repository_name}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "arn:aws:s3:::${var.artifact_bucket_name}/*"
      }
    ]
  })
}

# CodePipeline Service Role
resource "aws_iam_role" "codepipeline_role" {
  name_prefix = "codepipeline-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  name_prefix = "codepipeline-policy-"
  role        = aws_iam_role.codepipeline_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:GetObjectVersion"
        ]
        Resource = "arn:aws:s3:::${var.artifact_bucket_name}/*"
      },
       {
         Effect = "Allow"
         Action = [
           "codebuild:StartBuild",
           "codebuild:BatchGetBuilds",
           "codebuild:BatchGetReports",
           "codebuild:CreateReport",
           "codebuild:CreateReportGroup",
           "codebuild:UpdateReport",
           "codebuild:BatchPutTestReports"
         ]
         Resource = "*"
       },
      {
        Effect = "Allow"
        Action = [
          "codedeploy:CreateDeployment",
          "codedeploy:GetApplication",
          "codedeploy:GetApplicationRevision",
          "codedeploy:GetDeployment",
          "codedeploy:GetDeploymentConfig",
          "codedeploy:RegisterApplicationRevision"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      }
    ]
  })
}

# CodeDeploy Service Role
resource "aws_iam_role" "codedeploy_role" {
  name_prefix = "codedeploy-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codedeploy.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

# AWS Managed Policy for CodeDeploy to ECS
resource "aws_iam_role_policy_attachment" "codedeploy_managed_policy" {
  role       = aws_iam_role.codedeploy_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS"
}

resource "aws_iam_role_policy" "codedeploy_policy" {
  name_prefix = "codedeploy-policy-"
  role        = aws_iam_role.codedeploy_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:*",
          "elasticloadbalancing:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecs:*",
          "servicediscovery:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "iam:PassedToService" = [
              "ec2.amazonaws.com",
              "ecs-tasks.amazonaws.com"
            ]
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/codedeploy/*"
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

# ========================================
# CodeBuild Projects
# ========================================

# CodeBuild Project - Build Docker Images (Multi-Service)
resource "aws_codebuild_project" "build_project" {
  name         = local.codebuild_build_project
  service_role = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = var.codebuild_environment_compute_type
    image                       = var.codebuild_environment_image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = var.codebuild_privileged_mode

    # Environment variables for multi-service builds
    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "NEXTJS_REPO_NAME"
      value = var.ecr_nextjs_repository_name
    }

    environment_variable {
      name  = "GO_SERVER_REPO_NAME"
      value = var.ecr_go_server_repository_name
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec.yaml"
  }

  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild_build_log.name
    }
  }

  tags = var.common_tags
}

# CodeBuild Project - Security Scan
resource "aws_codebuild_project" "scan_project" {
  name         = "${local.codebuild_scan_project}-scan"
  service_role = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = var.codebuild_environment_image
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = var.codebuild_privileged_mode

    # Environment variables for security scan
    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "NEXTJS_REPO_NAME"
      value = var.ecr_nextjs_repository_name
    }

    environment_variable {
      name  = "GO_SERVER_REPO_NAME"
      value = var.ecr_go_server_repository_name
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec-scan.yaml"
  }

  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild_scan_log.name
    }
  }

  tags = var.common_tags
}

# ========================================
# CloudWatch Logs for CodeBuild
# ========================================

resource "aws_cloudwatch_log_group" "codebuild_build_log" {
  name_prefix       = "/aws/codebuild/${local.codebuild_build_project}"
  retention_in_days = 14

  tags = var.common_tags
}

resource "aws_cloudwatch_log_group" "codebuild_scan_log" {
  name_prefix       = "/aws/codebuild/${local.codebuild_scan_project}"
  retention_in_days = 14

  tags = var.common_tags
}

# ========================================
# CloudWatch Logs for CodeDeploy
# ========================================

resource "aws_cloudwatch_log_group" "codedeploy_log" {
  name_prefix       = "/aws/codedeploy/${local.codedeploy_app_name}"
  retention_in_days = 14

  tags = var.common_tags
}

# ========================================
# CodeDeploy Application
# ========================================

resource "aws_codedeploy_app" "app" {
  name             = local.codedeploy_app_name
  compute_platform = "ECS"

  tags = var.common_tags
}

# NextJS Deployment Group
resource "aws_codedeploy_deployment_group" "nextjs_deployment_group" {
  count                  = var.ecs_nextjs_cluster_name != "" && var.ecs_nextjs_service_name != "" ? 1 : 0
  app_name               = aws_codedeploy_app.app.name
  deployment_group_name  = "${local.codedeploy_group_name}-nextjs"
  deployment_config_name = var.environment == "prod" ? "CodeDeployDefault.ECSCanary10Percent5Minutes" : "CodeDeployDefault.ECSAllAtOnce"
  service_role_arn       = aws_iam_role.codedeploy_role.arn

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  }

  deployment_style {
    deployment_type   = "BLUE_GREEN"
    deployment_option = "WITH_TRAFFIC_CONTROL"
  }

  ecs_service {
    cluster_name = var.ecs_nextjs_cluster_name
    service_name = var.ecs_nextjs_service_name
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout    = "CONTINUE_DEPLOYMENT"
      wait_time_in_minutes = 0
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 0
    }
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = var.alb_nextjs_listener_arn != "" ? [var.alb_nextjs_listener_arn] : [""]
      }

      target_group {
        name = "${var.project_name}-nextjs-blue-${var.environment}"
      }

      target_group {
        name = "${var.project_name}-nextjs-green-${var.environment}"
      }
    }
  }

  tags = merge(var.common_tags, { Service = "nextjs" })
}

# Go Server Deployment Group
resource "aws_codedeploy_deployment_group" "go_deployment_group" {
  count                  = var.ecs_go_cluster_name != "" && var.ecs_go_service_name != "" ? 1 : 0
  app_name               = aws_codedeploy_app.app.name
  deployment_group_name  = "${local.codedeploy_group_name}-go"
  deployment_config_name = var.environment == "prod" ? "CodeDeployDefault.ECSCanary10Percent5Minutes" : "CodeDeployDefault.ECSAllAtOnce"
  service_role_arn       = aws_iam_role.codedeploy_role.arn

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE", "DEPLOYMENT_STOP_ON_ALARM"]
  }

  deployment_style {
    deployment_type   = "BLUE_GREEN"
    deployment_option = "WITH_TRAFFIC_CONTROL"
  }

  ecs_service {
    cluster_name = var.ecs_go_cluster_name
    service_name = var.ecs_go_service_name
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout    = "CONTINUE_DEPLOYMENT"
      wait_time_in_minutes = 0
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 0
    }
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = var.alb_go_listener_arn != "" ? [var.alb_go_listener_arn] : [""]
      }

      target_group {
        name = "${var.project_name}-go-server-blue-${var.environment}"
      }

      target_group {
        name = "${var.project_name}-go-server-green-${var.environment}"
      }
    }
  }

  tags = merge(var.common_tags, { Service = "go-server" })
}

# ========================================
# CodePipeline
# ========================================

resource "aws_codepipeline" "pipeline" {
  name     = local.codepipeline_name
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = var.artifact_bucket_name
    type     = "S3"

    dynamic "encryption_key" {
      for_each = var.kms_key_id != "" ? [1] : []
      content {
        id   = var.kms_key_id
        type = "KMS"
      }
    }
  }

  # ========================================
  # Source Stage - GitHub
  # ========================================
  dynamic "stage" {
    for_each = var.github_token != "" ? [1] : []
    content {
      name = "Source"

      action {
        name             = "SourceAction"
        category         = "Source"
        owner            = "ThirdParty"
        provider         = "GitHub"
        version          = "1"
        output_artifacts = ["source_output"]

        configuration = {
          Owner                = var.github_owner
          Repo                 = var.github_repo
          Branch               = var.environment == "prod" ? var.github_branch_main : var.github_branch_develop
          OAuthToken           = var.github_token
          PollForSourceChanges = "true" # falseの場合はGitHub Webhookでトリガーされる。trueの場合は定期的にGitHubをポーリングして変更を検出する。
        }
      }
    }
  }

  # ========================================
  # Build Stage - CodeBuild (Multi-Service)
  # ========================================
  stage {
    name = "Build"

    action {
      name             = "BuildAction"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build_project.name
      }
    }
  }

  # ========================================
  # Scan Stage - CodeBuild
  # ========================================
  stage {
    name = "Scan"

    action {
      name            = "ScanAction"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      input_artifacts = ["source_output"]
      version         = "1"

      configuration = {
        ProjectName = aws_codebuild_project.scan_project.name
      }
    }
  }

  # ========================================
  # Deploy Stage (Approval for Prod)
  # ========================================
  dynamic "stage" {
    for_each = var.environment == "prod" && var.enable_manual_approval ? [1] : []
    content {
      name = "Approval"

      action {
        name     = "ManualApproval"
        category = "Approval"
        owner    = "AWS"
        provider = "Manual"
        version  = "1"

        configuration = {
          CustomData = "本番環境へのデプロイを承認してください。"
        }
      }
    }
  }

  # ========================================
  # Deploy Stage 2 - Go Server Deployment
  # ========================================
  dynamic "stage" {
    for_each = var.ecs_go_cluster_name != "" && var.ecs_go_service_name != "" ? [1] : []
    content {
      name = "DeployGoServer"

      action {
        name            = "DeployGoServerAction"
        category        = "Deploy"
        owner           = "AWS"
        provider        = "CodeDeployToECS"
        input_artifacts = ["build_output"]
        version         = "1"
        run_order       = 1

        configuration = {
          ApplicationName                = aws_codedeploy_app.app.name
          DeploymentGroupName            = aws_codedeploy_deployment_group.go_deployment_group[0].deployment_group_name
          AppSpecTemplateArtifact        = "build_output"
          AppSpecTemplatePath            = "appspec-go-server.yaml"

          TaskDefinitionTemplateArtifact = "build_output"
          TaskDefinitionTemplatePath     = "go-server-taskdef.json"
        }
      }
    }
  }
  
  # ========================================
  # Deploy Stage 1 - Next.js Deployment
  # ========================================
  dynamic "stage" {
    for_each = var.ecs_nextjs_cluster_name != "" && var.ecs_nextjs_service_name != "" ? [1] : []
    content {
      name = "DeployNextJS"

      action {
        name            = "DeployNextJSAction"
        category        = "Deploy"
        owner           = "AWS"
        provider        = "CodeDeployToECS"
        input_artifacts = ["build_output"]
        version         = "1"
        run_order       = 2

        configuration = {
          ApplicationName         = aws_codedeploy_app.app.name
          DeploymentGroupName     = aws_codedeploy_deployment_group.nextjs_deployment_group[0].deployment_group_name
          AppSpecTemplateArtifact = "build_output"
          AppSpecTemplatePath     = "appspec-nextjs.yaml"

          TaskDefinitionTemplateArtifact = "build_output"
          TaskDefinitionTemplatePath     = "nextjs-taskdef.json"
        }
      }
    }
  }



  tags = var.common_tags
}

# ========================================
# AppSpec Files for Each Service
# ========================================

resource "local_file" "appspec_nextjs" {
  filename = "${path.module}/../../../appspec-nextjs.yaml"
  content = templatefile("${path.module}/appspec-nextjs.yaml.tpl", {
    container_name = "ecs-sample-nextjs"
    container_port = 3000
  })
}

resource "local_file" "appspec_go_server" {
  filename = "${path.module}/../../../appspec-go-server.yaml"
  content = templatefile("${path.module}/appspec-go-server.yaml.tpl", {
    container_name = "ecs-sample-go-server"
    container_port = 8080
  })
}

# ========================================
# GitHub Webhook
# ========================================

# Note: GitHub token needs to be stored in CodePipeline configuration
# This creates an automatic trigger for CodePipeline when code is pushed
