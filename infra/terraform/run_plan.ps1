#!/usr/bin/env pwsh

# Load environment variables from .env file or set manually before running this script
# 
# Option 1: Create a .env file with:
#   TF_VAR_cloudflare_api_token=your_token_here
#   CLOUDFLARE_API_TOKEN=your_token_here
#
# Option 2: Set environment variables before running:
#   $env:TF_VAR_cloudflare_api_token = "your_token_here"
#   $env:CLOUDFLARE_API_TOKEN = "your_token_here"

# Check if environment variables are set
if (-not $env:TF_VAR_cloudflare_api_token) {
  Write-Host "ERROR: TF_VAR_cloudflare_api_token environment variable is not set" -ForegroundColor Red
  Write-Host "Please set it before running this script" -ForegroundColor Yellow
  exit 1
}

if (-not $env:CLOUDFLARE_API_TOKEN) {
  Write-Host "ERROR: CLOUDFLARE_API_TOKEN environment variable is not set" -ForegroundColor Red
  Write-Host "Please set it before running this script" -ForegroundColor Yellow
  exit 1
}

Write-Host "Environment Variables Set:" -ForegroundColor Cyan
Write-Host "TF_VAR_cloudflare_api_token: $($env:TF_VAR_cloudflare_api_token.Substring(0,10))..." -ForegroundColor Cyan
Write-Host "CLOUDFLARE_API_TOKEN: $($env:CLOUDFLARE_API_TOKEN.Substring(0,10))..." -ForegroundColor Cyan

# Run terraform plan
Write-Host "Running terraform plan..." -ForegroundColor Green
& terraform plan -var-file environments/prod.tfvars 2>&1 | Tee-Object -FilePath plan_results.txt

# Check for errors
$exitCode = $LASTEXITCODE
Write-Host "Exit Code: $exitCode" -ForegroundColor Yellow