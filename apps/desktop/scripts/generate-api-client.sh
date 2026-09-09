#!/bin/bash

# OpenAPI Dart Client Generator Script
# This script generates the Dart API client from the OpenAPI spec

set -e

echo "🚀 Generating OpenAPI Dart Client..."
echo "Input spec: ../../../server/openapi.yaml"
echo "Output directory: lib/data/client"

# Run the OpenAPI generator
flutter pub run openapi_generator_cli generate \
  -i ../../../server/openapi.yaml \
  -g dart \
  -c openapi-generator-config.yaml \
  -o lib/data/client

echo "✅ API client generation complete!"
echo "Generated files:"
echo "  - lib/data/client/lib/ (Generated Dart classes)"
echo ""
echo "📝 Next steps:"
echo "  1. Review the generated files in lib/data/client/"
echo "  2. Update providers in lib/presentation/providers/ to use the generated client"
echo "  3. Run: flutter pub get"
echo "  4. Run: dart run build_runner build"
