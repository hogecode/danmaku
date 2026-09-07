# ========================================
# CloudFront Module - Using terraform-aws-cloudfront module
# ========================================

module "cloudfront_distribution" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "~> 3.0"

  enabled             = var.enabled
  is_ipv6_enabled     = var.is_ipv6_enabled
  default_root_object = var.default_root_object
  price_class         = var.price_class

  # Origin configuration
  # TODO: オリジンをALBのドメイン名にする
  # TODO: WAFをCloudfrontにつける
  # TODO: viewer_certificateでACMの証明書を指定する
  origin = {
    s3_origin = {
      domain_name = var.s3_bucket_domain_name
      origin_id   = var.origin_id
      
      s3_origin_config = {
        origin_access_identity = var.origin_access_identity
      }
    }
  }

  # Default cache behavior
  default_cache_behavior = {
    allowed_methods  = var.allowed_methods
    cached_methods   = var.cached_methods
    target_origin_id = var.origin_id
    compress         = var.compress

    # Forwarded values
    forwarded_values = {
      query_string = var.query_string
      cookies = {
        forward = var.cookies_forward
      }
    }

    viewer_protocol_policy = var.viewer_protocol_policy
    min_ttl                = var.min_ttl
    default_ttl            = var.default_ttl
    max_ttl                = var.max_ttl
  }

  # Geo restriction
  geo_restriction = {
    restriction_type = var.geo_restriction_type
    locations        = var.geo_restriction_locations
  }

  # Viewer certificate
  viewer_certificate = {
    cloudfront_default_certificate = var.use_default_certificate
    acm_certificate_arn            = var.acm_certificate_arn
    ssl_support_method             = var.ssl_support_method
    minimum_protocol_version       = var.minimum_protocol_version
  }

  tags = var.common_tags
}
