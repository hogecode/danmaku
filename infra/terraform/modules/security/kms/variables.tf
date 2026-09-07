# ========================================
# KMS Module Variables
# ========================================

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "enable_kms_encryption" {
  description = "Enable KMS encryption for various services"
  type        = bool
  default     = false
}

variable "kms_deletion_window_days" {
  description = "KMS key deletion window in days (7-30)"
  type        = number
  default     = 10
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
