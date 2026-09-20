output "redis_endpoint" {
  description = "Primary endpoint of the Redis cluster"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_port" {
  description = "Port of the Redis cluster"
  value       = aws_elasticache_replication_group.redis.port
}

output "redis_replication_group_id" {
  description = "Redis Replication Group ID"
  value       = aws_elasticache_replication_group.redis.id
}

output "redis_engine_version" {
  description = "Redis Engine Version"
  value       = aws_elasticache_replication_group.redis.engine_version
}
