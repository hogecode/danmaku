# ========================================
# Route53 Module - Using terraform-aws-route53 module
# ========================================

# TODO: ゾーンIDを取得できないか
# TODO: AWS内部ドメインのCNAMEレコードも必要かどうか確認する
# ドメインはCloudflareとかで買う必要があるので面倒
module "route53_records" {
  source  = "terraform-aws-modules/route53/aws//modules/records"
  version = "~> 2.0"

  zone_id = var.route53_zone_id

  records = concat(
    [
      {
        name    = var.domain_name
        type    = "A"
        alias = {
          name                   = var.alb_dns_name
          zone_id                = var.alb_zone_id
          evaluate_target_health = true
        }
      },
      {
        name    = "*.${var.domain_name}"
        type    = "A"
        alias = {
          name                   = var.alb_dns_name
          zone_id                = var.alb_zone_id
          evaluate_target_health = true
        }
      },
      {
        name    = "www.${var.domain_name}"
        type    = "A"
        alias = {
          name                   = var.alb_dns_name
          zone_id                = var.alb_zone_id
          evaluate_target_health = true
        }
      }
    ],
    var.dmarc_record != "" ? [
      {
        name    = "_dmarc.${var.domain_name}"
        type    = "TXT"
        ttl     = 300
        records = [var.dmarc_record]
      }
    ] : []
  )
}

# ========================================
# Route53 Health Check
# ========================================

resource "aws_route53_health_check" "main" {
  fqdn              = var.domain_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/up"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name = "${var.app_name}-${var.environment}-health-check"
  }
}
