# RDS Module - Using terraform-aws-modules

# ========================================
# RDS Instance using terraform-aws-modules
# ========================================

module "rds" {
  source = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${var.project_name}-db-${var.environment}"

  # Engine configuration
  engine               = var.rds_engine
  engine_version       = var.rds_engine_version
  family               = var.rds_parameter_group_family
  major_engine_version = var.rds_engine == "mysql" ? "8.0" : "14"

  # Instance configuration
  instance_class       = var.rds_instance_class
  allocated_storage    = var.rds_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true
  storage_throughput   = var.rds_allocated_storage >= 400 ? 125 : null

  # Database configuration
  db_name  = var.rds_database_name
  
  # Master user configuration
  # manage_master_user_password = true の場合、username を指定し、password は AWS が自動生成・管理する
  username = "admin"
  manage_master_user_password = true

  # Network configuration
  db_subnet_group_name            = aws_db_subnet_group.main.name
  publicly_accessible            = var.rds_publicly_accessible
  vpc_security_group_ids          = [var.rds_security_group_id]
  iam_database_authentication_enabled = true

  # High Availability
  multi_az = var.rds_multi_az

  # Backup & Recovery
  backup_retention_period = var.rds_backup_retention_days
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot   = true
  skip_final_snapshot     = var.environment != "prod"
  final_snapshot_identifier_prefix = var.environment == "prod" ? "${var.project_name}-db-final-snapshot" : null

  # Enhanced Monitoring
  enabled_cloudwatch_logs_exports = var.enable_enhanced_monitoring ? [
    var.rds_engine == "mysql" ? "error" : "postgresql",
    var.rds_engine == "mysql" ? "slowquery" : "upgrade",
    "audit"
  ] : []
  monitoring_interval = var.enable_enhanced_monitoring ? 60 : 0
  monitoring_role_arn = var.enable_enhanced_monitoring ? aws_iam_role.rds_monitoring[0].arn : null

  # Deletion Protection
  deletion_protection = var.environment == "prod" ? true : false

   # Parameter Group
   # TODO: locals内でパラメータのリストを作成して、forループで変換する
   parameters = [
     for k, v in var.rds_parameters : {
       name  = k
       value = v
     }
   ]

  tags = {
    Name = "${var.project_name}-db-${var.environment}"
  }
}

# ========================================
# DB Subnet Group
# ========================================

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group-${var.environment}"
  subnet_ids = var.private_db_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group-${var.environment}"
  }
}

# ========================================
# RDS Enhanced Monitoring IAM Role
# ========================================

resource "aws_iam_role" "rds_monitoring" {
  count = var.enable_enhanced_monitoring ? 1 : 0
  name  = "${var.project_name}-rds-monitoring-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-rds-monitoring-role-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = var.enable_enhanced_monitoring ? 1 : 0
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ========================================
# RDS CloudWatch Alarms
# ========================================

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  count = try(module.rds.this_db_instance_id, module.rds.db_instance_id, "") != "" ? 1 : 0

  alarm_name          = "${var.project_name}-rds-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when RDS CPU exceeds 80%"

  dimensions = {
    DBInstanceIdentifier = try(module.rds.this_db_instance_id, module.rds.db_instance_id, "")
  }

  tags = {
    Name = "${var.project_name}-rds-cpu-high-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  count = try(module.rds.this_db_instance_id, module.rds.db_instance_id, "") != "" ? 1 : 0

  alarm_name          = "${var.project_name}-rds-storage-low-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240 # 10 GB in bytes
  alarm_description   = "Alert when RDS storage is below 10 GB"

  dimensions = {
    DBInstanceIdentifier = try(module.rds.this_db_instance_id, module.rds.db_instance_id, "")
  }

  tags = {
    Name = "${var.project_name}-rds-storage-low-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  count = try(module.rds.this_db_instance_id, module.rds.db_instance_id, "") != "" ? 1 : 0

  alarm_name          = "${var.project_name}-rds-connections-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Alert when RDS connections exceed 80"

  dimensions = {
    DBInstanceIdentifier = try(module.rds.this_db_instance_id, module.rds.db_instance_id, "")
  }

  tags = {
    Name = "${var.project_name}-rds-connections-high-${var.environment}"
  }
}
