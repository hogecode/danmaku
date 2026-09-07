# ========================================
# SQS Queues for Laravel Jobs (using terraform-aws-modules)
# ========================================

locals {
  sqs_suffix = "-${var.app_name}-${var.environment}"
}

# Shared dead letter queue for failed jobs
module "sqs_deadletter" {
  source = "terraform-aws-modules/sqs/aws"
  version = "~> 4.0"

  name                       = "deadletter${local.sqs_suffix}"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 1209600 # 14 days
  receive_wait_time_seconds  = 20
  kms_master_key_id          = var.sqs_kms_key_arn

  tags = merge(var.common_tags, {
    Name = "deadletter${local.sqs_suffix}"
  })
}

# Application queues (one per logical queue name)
module "sqs_queues" {
  for_each = toset(var.queue_names)

  source = "terraform-aws-modules/sqs/aws"
  version = "~> 4.0"

  name                       = "${each.key}${local.sqs_suffix}"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 1209600 # 14 days
  receive_wait_time_seconds  = 20      # Long polling
  visibility_timeout_seconds = 300     # 5 minutes
  kms_master_key_id          = var.sqs_kms_key_arn

  # 自動でjson_encodeされるので、ここでは文字列として定義する
   redrive_policy = {
     deadLetterTargetArn = module.sqs_deadletter.queue_arn
     maxReceiveCount     = "3"
   }

  tags = merge(var.common_tags, {
    Name = "${each.key}${local.sqs_suffix}"
  })
}
