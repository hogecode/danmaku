# ========================================
# Lambda Module Outputs
# ========================================

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = module.lambda_function.lambda_function_arn
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = module.lambda_function.lambda_function_name
}

output "lambda_function_invoke_arn" {
  description = "Lambda function invoke ARN"
  value       = module.lambda_function.lambda_function_invoke_arn
}

output "lambda_role_arn" {
  description = "Lambda IAM role ARN"
  value       = module.lambda_function.lambda_role_arn
}

output "lambda_role_name" {
  description = "Lambda IAM role name"
  value       = module.lambda_function.lambda_role_name
}

output "lambda_cloudwatch_log_group_name" {
  description = "CloudWatch log group name for Lambda"
  value       = module.lambda_function.lambda_cloudwatch_log_group_name
}

output "lambda_cloudwatch_log_group_arn" {
  description = "CloudWatch log group ARN for Lambda"
  value       = module.lambda_function.lambda_cloudwatch_log_group_arn
}
