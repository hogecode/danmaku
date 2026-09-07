# ========================================
# ECR Module Variables
# ========================================

variable "ecr_nextjs_repository_name" {
  description = "ECR repository name for Next.js application"
  type        = string
  default     = ""
}

variable "ecr_go_server_repository_name" {
  description = "ECR repository name for Go server application"
  type        = string
  default     = ""
}

variable "ecr_image_tag_mutability" {
  description = "The tag mutability setting for the repository"
  type        = string
  default     = "MUTABLE"
  
  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.ecr_image_tag_mutability)
    error_message = "Must be MUTABLE or IMMUTABLE."
  }
}

variable "ecr_image_scan_on_push" {
  description = "Indicates whether images are scanned after being pushed to the repository"
  type        = bool
  default     = true
}
