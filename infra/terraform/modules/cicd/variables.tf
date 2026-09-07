# ========================================
# CI/CD Module Variables
# ========================================

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "hogecode"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "ecs-sample"
}

variable "github_branch_develop" {
  description = "Develop branch for staging deployment"
  type        = string
  default     = "develop"
}

variable "github_branch_main" {
  description = "Main branch for production deployment"
  type        = string
  default     = "main"
}

variable "github_token" {
  description = "GitHub OAuth token for CodePipeline"
  type        = string
  sensitive   = true
}

variable "ecr_nextjs_repository_name" {
  description = "ECR repository name for Next.js application"
  type        = string
  default     = "ecs-nextjs"
}

variable "ecr_go_server_repository_name" {
  description = "ECR repository name for Go Server"
  type        = string
  default     = "ecs-go-server"
}

variable "ecs_cluster_name" {
  description = "ECS cluster name (for backward compatibility, will be deprecated)"
  type        = string
  default     = ""
}

variable "ecs_service_name" {
  description = "ECS service name (for backward compatibility, will be deprecated)"
  type        = string
  default     = ""
}

# NextJS Service Configuration
variable "ecs_nextjs_cluster_name" {
  description = "ECS cluster name for Next.js service"
  type        = string
  default     = ""
}

variable "ecs_nextjs_service_name" {
  description = "ECS service name for Next.js service"
  type        = string
  default     = ""
}

# Go Server Service Configuration
variable "ecs_go_cluster_name" {
  description = "ECS cluster name for Go Server service"
  type        = string
  default     = ""
}

variable "ecs_go_service_name" {
  description = "ECS service name for Go Server service"
  type        = string
  default     = ""
}

variable "ecs_task_definition_family" {
  description = "ECS task definition family"
  type        = string
  default     = "ecs-sample"
}

variable "alb_target_group_arn" {
  description = "ALB target group ARN for load balancer configuration"
  type        = string
  default     = ""
}

variable "alb_target_group_name" {
  description = "ALB target group name for CodeDeploy configuration"
  type        = string
  default     = ""
}

variable "alb_nextjs_listener_arn" {
  description = "ALB listener ARN for NextJS Blue/Green deployment"
  type        = string
  default     = ""
}

variable "alb_go_listener_arn" {
  description = "ALB listener ARN for Go Server Blue/Green deployment"
  type        = string
  default     = ""
}

variable "codebuild_environment_compute_type" {
  description = "CodeBuild compute type"
  type        = string
  default     = "BUILD_GENERAL1_MEDIUM"

  validation {
    condition     = contains(["BUILD_GENERAL1_SMALL", "BUILD_GENERAL1_MEDIUM", "BUILD_GENERAL1_LARGE"], var.codebuild_environment_compute_type)
    error_message = "Compute type must be one of: BUILD_GENERAL1_SMALL, BUILD_GENERAL1_MEDIUM, BUILD_GENERAL1_LARGE"
  }
}

variable "codebuild_environment_image" {
  description = "CodeBuild environment image"
  type        = string
  default     = "aws/codebuild/standard:5.0"
}

variable "codebuild_privileged_mode" {
  description = "Whether to run CodeBuild in privileged mode (required for Docker builds)"
  type        = bool
  default     = true
}

variable "artifact_bucket_name" {
  description = "S3 bucket name for CodePipeline artifacts"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID for artifact encryption"
  type        = string
  default     = ""
}

variable "enable_manual_approval" {
  description = "Enable manual approval for production deployment"
  type        = bool
  default     = true
}

variable "codedeploy_termination_wait_time_in_minutes" {
  description = "The number of minutes to wait before terminating Blue resources on the original instances during an in-place deployment"
  type        = number
  default     = 5
}

variable "codedeploy_deployment_ready_wait_time_in_minutes" {
  description = "The number of minutes before deployment terminates unhealthy instances in blue instances"
  type        = number
  default     = 0
}

variable "codedeploy_green_fleet_provisioning_option" {
  description = "Describe the instances to be used with the deployment"
  type        = string
  default     = "COPY_AUTO_SCALING_GROUP"
}

variable "enable_deployment_triggers" {
  description = "Enable SNS triggers for deployment notifications"
  type        = bool
  default     = false
}

variable "deployment_trigger_sns_topic_arn" {
  description = "SNS topic ARN for deployment notifications"
  type        = string
  default     = ""
}

variable "enable_alarm_configuration" {
  description = "Enable CloudWatch alarm configuration for deployments"
  type        = bool
  default     = false
}

variable "alarm_names" {
  description = "List of CloudWatch alarm names to monitor during deployment"
  type        = list(string)
  default     = []
}

variable "ignore_poll_alarm_failure" {
  description = "Whether to ignore failure when CloudWatch alarms cannot be polled"
  type        = bool
  default     = false
}

variable "use_target_group_pair_info" {
  description = "Use target group pair info for more advanced load balancer configuration (recommended for blue/green deployments)"
  type        = bool
  default     = false
}

variable "alb_listener_arns" {
  description = "List of ALB listener ARNs for target group pair configuration"
  type        = list(string)
  default     = []
}

variable "blue_green_test_traffic_route_listener_arns" {
  description = "List of ALB listener ARNs for test traffic route in blue/green deployments"
  type        = list(string)
  default     = []
}

variable "codedeploy_deployment_ready_action_on_timeout" {
  description = "The action to take when new Green instances are ready to receive traffic"
  type        = string
  default     = "CONTINUE_DEPLOYMENT"
  
  validation {
    condition     = contains(["CONTINUE_DEPLOYMENT", "STOP_DEPLOYMENT"], var.codedeploy_deployment_ready_action_on_timeout)
    error_message = "Action must be one of: CONTINUE_DEPLOYMENT, STOP_DEPLOYMENT"
  }
}

variable "codedeploy_termination_action" {
  description = "The action to take on instances in the original environment after a successful blue/green deployment"
  type        = string
  default     = "TERMINATE"
  
  validation {
    condition     = contains(["TERMINATE", "KEEP_ALIVE"], var.codedeploy_termination_action)
    error_message = "Action must be one of: TERMINATE, KEEP_ALIVE"
  }
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
