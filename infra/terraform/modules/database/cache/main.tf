# ========================================
# ElastiCache Redis Cluster (using terraform-aws-modules)
# ========================================

module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"
  version = "~> 1.0"

  replication_group_id     = "${var.app_name}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = "${var.app_name}-${var.environment}-redis-params"
  subnet_group_name    = "${var.app_name}-${var.environment}-redis-subnet-group"
  security_group_ids   = [var.redis_security_group_id]

  # Parameter group
  parameter_group_family = "redis7"
  parameters = [
    {
      name  = "maxmemory-policy"
      value = "allkeys-lru"
    }
  ]

  # Subnet group
  subnet_ids = var.private_subnets

  # Backup configuration
  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window          = var.snapshot_window
  maintenance_window       = var.maintenance_window

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-redis"
  })
}
