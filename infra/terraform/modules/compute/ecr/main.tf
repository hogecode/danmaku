# ========================================
# ECR Module - Using terraform-aws-ecr module
# ========================================

module "nextjs_ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.0"

  repository_name                = var.ecr_nextjs_repository_name
  repository_type                = "private"
  repository_image_tag_mutability = var.ecr_image_tag_mutability
  
  repository_image_scan_on_push   = var.ecr_image_scan_on_push

  # Lifecycle policy
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })

  tags = {
    Name = var.ecr_nextjs_repository_name
  }
}

module "go_server_ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.0"

  repository_name                = var.ecr_go_server_repository_name
  repository_type                = "private"
  repository_image_tag_mutability = var.ecr_image_tag_mutability
  
  repository_image_scan_on_push   = var.ecr_image_scan_on_push

  # Lifecycle policy
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })

  tags = {
    Name = var.ecr_go_server_repository_name
  }
}
