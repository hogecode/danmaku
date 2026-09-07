output "redis_endpoint" {
  description = "Endpoint of the Redis cluster"
  value       = module.elasticache.cluster_address
}

output "redis_port" {
  description = "Port of the Redis cluster"
  value       = 6379
}
