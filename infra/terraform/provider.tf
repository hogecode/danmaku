provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(
      local.common_tags
    )
  }
}

# Cloudflare Provider Configuration
# Supports authentication via:
# 1. Environment variable: CLOUDFLARE_API_TOKEN
# 2. Terraform variable: var.cloudflare_api_token
# 3. Provider configuration argument

provider "cloudflare" {
  api_token = var.cloudflare_api_token != "" ? var.cloudflare_api_token : null
}
