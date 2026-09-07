

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(
      local.common_tags
    )
  }
}
