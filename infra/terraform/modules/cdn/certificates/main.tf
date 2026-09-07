# ========================================
# SSL Certificate (using terraform-aws-modules)
# ========================================

# TODO: 証明書を作成しているだけなのでALBかCFNにアタッチする必要
# これだけではHTTPS対応しない
module "acm_certificate" {
  source = "terraform-aws-modules/acm/aws"
  version = "~> 4.0"

  domain_name           = var.domain_name != "" ? var.domain_name : "example.com"
  subject_alternative_names = var.domain_name != "" ? ["*.${var.domain_name}"] : []
  validation_method     = "DNS" # Emailも選べるが、DNSの方が自動化しやすい
  # TODO: route53_zone_idは環境変数から取得するようにする
  #route53_zone_id      = var.route53_zone_id != "" ? var.route53_zone_id : null

  # Disable automatic validation - manual validation via Route53 will be done separately
  # when route53_zone_id is provided
  create_certificate   = true
  validate_certificate = true

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-cert"
  })
}
