terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.9"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }

  # S3 backend for state management
  # Uses Terraform workspaces for environment isolation
  backend "s3" {
    bucket               = "terraform-state-ecs-sample"
    key                  = "ecs-sample/terraform.tfstate"
    workspace_key_prefix = "env"
    region               = "ap-northeast-1"
    encrypt              = true
    # dynamodb_table       = "laravel-terraform-locks"
  }
}

