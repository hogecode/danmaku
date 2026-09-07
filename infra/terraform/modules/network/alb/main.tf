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

  # Listeners configuration
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

    # Target groups for Next.js (Blue/Green)
    target_groups = {
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
           path                = "/api/health"
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
      nextjs-green = {
        name             = "${var.project_name}-nextjs-green-${var.environment}"
        backend_protocol = "HTTP"
        backend_port     = 3000
        target_type      = "ip"
        create_attachment = false
        health_check = {
          healthy_threshold   = 2
          unhealthy_threshold = 2
          timeout             = 5
          interval            = 30
          path                = "/api/health"
          matcher             = "200"
        }
        stickiness = {
          type            = "lb_cookie"
          enabled         = true
          cookie_duration = 86400
        }
        tags = {
          Name = "${var.project_name}-nextjs-green-tg-${var.environment}"
        }
      }
    }

  tags = {
    Name = "${var.project_name}-public-alb-${var.environment}"
  }
}

module "private_alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 9.0"

  name            = "${var.project_name}-private-alb-${var.environment}"
  internal        = true
  load_balancer_type = "application"
  vpc_id          = var.vpc_id
  subnets         = var.private_api_subnet_ids
  security_groups = [var.private_alb_security_group_id]

  enable_deletion_protection = var.environment == "prod" ? true : false
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  # Listeners configuration for internal service
  listeners = {
    http = {
      port        = 8080
      protocol    = "HTTP"
      forward = {
        target_group_key = "go-server-blue"
      }
    }
  }

   # Target groups for Go Server (Blue/Green)
   target_groups = {
     go-server-blue = {
       name             = "${var.project_name}-go-server-blue-${var.environment}"
       backend_protocol = "HTTP"
       backend_port     = 8080
       target_type      = "ip"
       create_attachment = false
       health_check = {
         enabled             = true
         healthy_threshold   = 2
         unhealthy_threshold = 3
         timeout             = 5
         interval            = 30
         path                = "/api/health"
         matcher             = "200-399"
         port                = "traffic-port"
       }
       stickiness = {
         type            = "lb_cookie"
         enabled         = true
         cookie_duration = 86400
       }
       tags = {
         Name = "${var.project_name}-go-server-blue-tg-${var.environment}"
       }
     }
     go-server-green = {
       name             = "${var.project_name}-go-server-green-${var.environment}"
       backend_protocol = "HTTP"
       backend_port     = 8080
       target_type      = "ip"
       create_attachment = false
       health_check = {
         enabled             = true
         healthy_threshold   = 2
         unhealthy_threshold = 3
         timeout             = 5
         interval            = 30
         path                = "/api/health"
         matcher             = "200-399"
         port                = "traffic-port"
       }
       stickiness = {
         type            = "lb_cookie"
         enabled         = true
         cookie_duration = 86400
       }
       tags = {
         Name = "${var.project_name}-go-server-green-tg-${var.environment}"
       }
     }
   }

  tags = {
    Name = "${var.project_name}-private-alb-${var.environment}"
  }
}
