# ========================================
# CloudWatch Logs Read Permission for CI/CD
# ========================================

resource "aws_iam_role_policy" "cloudwatch_logs_read_policy" {
  name_prefix = "cloudwatch-logs-read-"
  role        = aws_iam_role.github_oidc_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:GetLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}
