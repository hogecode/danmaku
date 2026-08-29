#!/bin/bash

# Docker Compose でホットリロード有効化のための再構築スクリプト

echo "🔄 Stopping and removing containers..."
docker-compose down

echo "🧹 Cleaning up volumes and images..."
docker volume rm danmaku_web_node_modules danmaku_web_next 2>/dev/null || true
docker image rm danmaku-web 2>/dev/null || true

echo "🏗️ Building and starting containers..."
docker-compose up --build

echo "✅ Done! The web container should now support hot-reload."
echo "📝 Try editing a file in apps/web/app to test hot-reload."
