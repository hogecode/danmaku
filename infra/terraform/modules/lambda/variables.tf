# ========================================
# Lambda Module Variables
# ========================================

variable "lambda_function_name" {
  description = "Lambda function name"
  type        = string
}

variable "lambda_description" {
  description = "Lambda function description"
  type        = string
  default     = ""
}

variable "lambda_handler" {
  description = "Lambda function handler"
  type        = string
  default     = "index.handler"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "python3.11"
}

variable "lambda_source_path" {
  description = "Path to Lambda source code"
  type        = string
  default     = ""
}

variable "environment_variables" {
  description = "Environment variables for Lambda"
  type        = map(string)
  default     = {}
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 128
}

variable "vpc_subnet_ids" {
  description = "VPC subnet IDs for Lambda"
  type        = list(string)
  default     = []
}

variable "vpc_security_group_ids" {
  description = "VPC security group IDs for Lambda"
  type        = list(string)
  default     = []
}

variable "policy_statements" {
  description = "IAM policy statements for Lambda"
  type        = any
  default     = {}
}

variable "logs_retention_days" {
  description = "CloudWatch logs retention in days"
  type        = number
  default     = 14
}

variable "enable_xray_tracing" {
  description = "Enable X-Ray tracing for Lambda"
  type        = bool
  default     = false
}

variable "reserved_concurrent_executions" {
  description = "Reserved concurrent executions for Lambda"
  type        = number
  default     = -1
}

variable "lambda_layers" {
  description = "Lambda layer ARNs"
  type        = list(string)
  default     = []
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "enable_event_trigger" {
  description = "Enable EventBridge trigger for Lambda"
  type        = bool
  default     = false
}

variable "event_schedule_expression" {
  description = "EventBridge schedule expression"
  type        = string
  default     = "rate(1 hour)"
}

variable "event_input_path" {
  description = "EventBridge input path"
  type        = string
  default     = "$"
}

# ========================================
# S3 Trigger Configuration
# ========================================

variable "enable_s3_trigger" {
  description = "Enable S3 event notification trigger for Lambda"
  type        = bool
  default     = false
}

variable "s3_bucket_id" {
  description = "S3 bucket ID for triggering Lambda"
  type        = string
  default     = ""
}

variable "s3_key_prefix" {
  description = "S3 object key prefix filter for Lambda trigger"
  type        = string
  default     = ""
}

variable "s3_events" {
  description = "S3 events that trigger Lambda (e.g., s3:ObjectCreated:*)"
  type        = list(string)
  default     = ["s3:ObjectCreated:*"]
}

# ========================================
# S3 Validation Configuration
# ========================================

variable "allowed_file_types" {
  description = "Allowed MIME types for S3 file validation"
  type        = list(string)
  default     = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
}

variable "max_file_size_mb" {
  description = "Maximum file size in MB"
  type        = number
  default     = 10
}
