# SQS Outputs

output "sqs_suffix" {
  description = "SQS queue name suffix (e.g., -myapp-production)"
  value       = local.sqs_suffix
}

output "queue_names_csv" {
  description = "Comma-separated list of logical queue names for the worker"
  value       = join(",", var.queue_names)
}

output "queue_urls" {
  description = "Map of logical queue name to SQS queue URL"
  value       = { for k, q in module.sqs_queues : k => q.queue_url }
}

output "queue_arns" {
  description = "Map of logical queue name to SQS queue ARN"
  value       = { for k, q in module.sqs_queues : k => q.queue_arn }
}

output "deadletter_queue_arn" {
  description = "ARN of the deadletter SQS queue"
  value       = module.sqs_deadletter.queue_arn
}

output "deadletter_queue_url" {
  description = "URL of the SQS dead letter queue"
  value       = module.sqs_deadletter.queue_url
}
