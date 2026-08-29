#!/bin/bash
# Generate mkcert certificates for local development

set -e

CERTS_DIR="${CERTS_DIR:-.certs}"

# Create certs directory
mkdir -p "$CERTS_DIR"

echo "🔐 Generating certificates using mkcert..."

# Install mkcert if not already installed
if ! command -v mkcert &> /dev/null; then
    echo "📦 Installing mkcert..."
    apk add --no-cache curl
    
    # Download mkcert
    MKCERT_VERSION="v1.4.4"
    MKCERT_URL="https://github.com/FiloSottile/mkcert/releases/download/${MKCERT_VERSION}/mkcert-${MKCERT_VERSION}-linux-amd64"
    
    curl -L "$MKCERT_URL" -o /usr/local/bin/mkcert
    chmod +x /usr/local/bin/mkcert
    echo "✅ mkcert installed"
fi

# Create local CA (only if not exists)
if [ ! -f "$CERTS_DIR/rootCA.pem" ]; then
    echo "🏢 Creating local CA..."
    CAROOT="$CERTS_DIR" mkcert -install
    echo "✅ Local CA created"
else
    echo "✓ Local CA already exists"
fi

# Generate certificates for .local domains
echo "🔑 Generating certificates for .local domains..."
CAROOT="$CERTS_DIR" mkcert \
    -cert-file "$CERTS_DIR/cert.pem" \
    -key-file "$CERTS_DIR/key.pem" \
    localhost \
    127.0.0.1 \
    web.local \
    api.local \
    "*.local"

echo "✅ Certificates generated:"
echo "   - Key: $CERTS_DIR/key.pem"
echo "   - Cert: $CERTS_DIR/cert.pem"
echo "   - Root CA: $CERTS_DIR/rootCA.pem"

# Trust the local CA on macOS/Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Trusting local CA on macOS..."
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERTS_DIR/rootCA.pem" 2>/dev/null || echo "⚠️  Could not auto-trust CA, please do manually"
elif [[ "$OSTYPE" == "linux"* ]]; then
    echo "🐧 Trusting local CA on Linux..."
    if command -v update-ca-certificates &> /dev/null; then
        sudo cp "$CERTS_DIR/rootCA.pem" /usr/local/share/ca-certificates/mkcert-ca.crt
        sudo update-ca-certificates
    else
        echo "⚠️  Please manually trust the CA from: $CERTS_DIR/rootCA.pem"
    fi
fi

echo "🎉 Certificate generation complete!"
