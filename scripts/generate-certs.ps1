# PowerShell script to generate mkcert certificates for Windows

param(
    [string]$CertsDir = ".\.certs"
)

function Test-Mkcert {
    try {
        $null = & mkcert -version
        return $true
    } catch {
        return $false
    }
}

function Test-Choco {
    try {
        $null = & choco --version
        return $true
    } catch {
        return $false
    }
}

Write-Host "🔐 Danmaku Certificate Generation Script (Windows)" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Create certs directory
if (-not (Test-Path $CertsDir)) {
    New-Item -ItemType Directory -Path $CertsDir -Force | Out-Null
    Write-Host "✓ Created directory: $CertsDir" -ForegroundColor Green
}

# Check if mkcert is installed
if (-not (Test-Mkcert)) {
    Write-Host "❌ mkcert is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Installation options:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey: choco install mkcert" -ForegroundColor White
    Write-Host "2. Winget: winget install FiloSottile.mkcert" -ForegroundColor White
    Write-Host "3. Scoop: scoop install mkcert" -ForegroundColor White
    Write-Host "4. Manual: https://github.com/FiloSottile/mkcert/releases" -ForegroundColor White
    Write-Host ""
    Write-Host "⏭️  Attempting automatic installation via Chocolatey..." -ForegroundColor Yellow
    
    if (Test-Choco) {
        Write-Host "📦 Chocolatey found, installing mkcert..." -ForegroundColor Cyan
        & choco install -y mkcert
        
        if (Test-Mkcert) {
            Write-Host "✅ mkcert installed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install mkcert via Chocolatey" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Chocolatey not found. Please install mkcert manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ mkcert is installed" -ForegroundColor Green
Write-Host ""

# Generate certificates
Write-Host "🔑 Generating certificates..." -ForegroundColor Cyan

$CertsAbsolute = (Resolve-Path $CertsDir).Path

# Create local CA
if (-not (Test-Path "$CertsAbsolute\rootCA.pem")) {
    Write-Host "🏢 Creating local CA..." -ForegroundColor Cyan
    $env:CAROOT = $CertsAbsolute
    & mkcert -install
    Write-Host "✅ Local CA created and installed" -ForegroundColor Green
} else {
    Write-Host "✓ Local CA already exists" -ForegroundColor Green
}

# Generate certificates
Write-Host "🔑 Generating certificates for domains..." -ForegroundColor Cyan
$env:CAROOT = $CertsAbsolute
& mkcert `
    -cert-file "$CertsAbsolute\cert.pem" `
    -key-file "$CertsAbsolute\key.pem" `
    localhost `
    127.0.0.1 `
    web.local `
    api.local `
    "*.local"

Write-Host ""
Write-Host "✅ Certificate generation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Certificate files:" -ForegroundColor Cyan
Write-Host "   - Certificate: $CertsAbsolute\cert.pem" -ForegroundColor White
Write-Host "   - Key: $CertsAbsolute\key.pem" -ForegroundColor White
Write-Host "   - Root CA: $CertsAbsolute\rootCA.pem" -ForegroundColor White
Write-Host ""
Write-Host "✅ The local CA is now trusted on your system!" -ForegroundColor Green
Write-Host "🌐 HTTPS access now works without certificate warnings:" -ForegroundColor Cyan
Write-Host "   - https://localhost" -ForegroundColor White
Write-Host "   - https://web.local" -ForegroundColor White
Write-Host "   - https://api.local" -ForegroundColor White
