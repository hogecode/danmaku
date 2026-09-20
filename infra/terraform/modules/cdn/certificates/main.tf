# ========================================
# SSL/TLS Certificate (ACM)
# ========================================

# ACM Certificate for HTTPS listener on ALB
# - Certificate is created with DNS validation
# - Domain and wildcard (*.domain) are included
# - Certificate will be attached to ALB via ALB module
module "acm_certificate" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 4.0"

  domain_name               = var.domain_name != "" ? var.domain_name : "example.com"
  subject_alternative_names = var.domain_name != "" ? ["*.${var.domain_name}"] : []
  validation_method         = "DNS"

  create_certificate   = true
  validate_certificate = true

  tags = merge(var.common_tags, {
    Name = "${var.app_name}-${var.environment}-cert"
  })
}
