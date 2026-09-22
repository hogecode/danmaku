# ========================================
# ALB Module - Using terraform-aws-alb module
# ========================================

module "public_alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name            = "${var.project_name}-public-alb-${var.environment}"
  internal        = false
  load_balancer_type = "application"
  vpc_id          = var.vpc_id
  subnets         = var.public_subnet_ids
  security_groups = [var.alb_public_security_group_id]

  enable_deletion_protection = var.environment == "prod" ? true : false
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  # Listeners configuration with default forward to Next.js
  # Note: Rules for routing to NestJS are created via separate aws_lb_listener_rule resources below
  listeners = merge(
    {
      http = {
        port        = 80
        protocol    = "HTTP"
        forward = {
          target_group_key = "nextjs-blue"
        }
      }
    },
    var.enable_https ? {
      https = {
        port            = 443
        protocol        = "HTTPS"
        certificate_arn = var.alb_certificate_arn
        forward = {
          target_group_key = "nextjs-blue"
        }
      }
    } : {}
  )

  # Target groups for Next.js and NestJS
  target_groups = {
    # Next.js Target Group (Blue/Green)
    nextjs-blue = {
      name             = "${var.project_name}-nextjs-blue-${var.environment}"
      backend_protocol = "HTTP"
      backend_port     = 3000
      target_type      = "ip"
      create_attachment = false
      health_check = {
        healthy_threshold   = 2
        unhealthy_threshold = 2
        timeout             = 5
        interval            = 30
        path                = "/"
        matcher             = "200"
      }
      stickiness = {
        type            = "lb_cookie"
        enabled         = true
        cookie_duration = 86400
      }
      tags = {
        Name = "${var.project_name}-nextjs-blue-tg-${var.environment}"
      }
    }

    # NestJS Target Group (Blue/Green)
    nestjs-blue = {
      name             = "${var.project_name}-nestjs-blue-${var.environment}"
      backend_protocol = "HTTP"
      backend_port     = 3001
      target_type      = "ip"
      create_attachment = false
      health_check = {
        healthy_threshold   = 3
        unhealthy_threshold = 3
        timeout             = 10
        interval            = 60
        path                = "/api/health"
        matcher             = "200"
      }
      stickiness = {
        type            = "lb_cookie"
        enabled         = true
        cookie_duration = 86400
      }
      tags = {
        Name = "${var.project_name}-nestjs-blue-tg-${var.environment}"
      }
    }
  }

  tags = {
    Name = "${var.project_name}-public-alb-${var.environment}"
  }

}


