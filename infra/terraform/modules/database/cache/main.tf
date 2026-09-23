# ========================================
# ElastiCache Redis Cluster
# ========================================
# 注意: Terraform AWS modules/elasticache は複雑な依存関係を持つため、
# 直接 aws_elasticache_* リソースを使用する方が安定している

# Redis Subnet Group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.app_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.private_subnets

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-redis-subnet-group"
  })
}

# Redis Replication Group (Cluster Mode Disabled - Single Primary)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.app_name}-${var.environment}-redis"
  description          = "Redis cluster for ${var.app_name}-${var.environment}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_clusters   = 1
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [var.redis_security_group_id]

  # Automatic Failover (requires 2 or more nodes, disabled for single node)
  automatic_failover_enabled = false

  # Backup & Snapshot Configuration
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window          = var.snapshot_window
  maintenance_window       = var.maintenance_window

  # Tags
  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-redis"
  })
}

# Redis Parameter Group
resource "aws_elasticache_parameter_group" "redis" {
  family = "redis7"
  name   = "${var.app_name}-${var.environment}-redis-params"

  # Recommended parameters for optimal performance
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-redis-params"
  })
}
