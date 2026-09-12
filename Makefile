## ========================
## API コード生成 (Windows用)
## ========================

.PHONY: generate-api-client
generate-api-client: ## Axios TypeScriptクライアント生成 (Web用)
	powershell -Command "$$pwd = pwd; docker run --rm -v \"$$pwd`:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g typescript-axios -o /local/apps/web/lib/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis"

.PHONY: generate-mobile-client
generate-mobile-client: ## TypeScript Fetch クライアント生成 (React Native/Expo用)
	powershell -Command "$$pwd = pwd; docker run --rm -v \"$$pwd`:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g typescript-fetch -o /local/apps/mobile/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis"

.PHONY: generate-flutter-client
generate-flutter-client: ## Dart OpenAPIクライアント生成 (Flutter用 - Docker使用)
	powershell -Command "$$pwd = pwd; docker run --rm -v \"$$pwd`:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g dart -o /local/apps/desktop/lib/data/client --additional-properties=hideGenerationTimestamp=true,pubName=desktop,pubVersion=1.0.0"

.PHONY: generate-all-clients
generate-all-clients: generate-api-client generate-mobile-client generate-flutter-client ## すべてのクライアント生成 (Web + Mobile + Flutter)
	@echo "All clients generated successfully!"


# desktop (Flutter)
.PHONY: flutter-build-runner
flutter-build-runner: ## Flutter build_runner 実行
	cd apps/desktop && flutter pub run build_runner build --delete-conflicting-outputs


# mobile (React Native/Expo)
.PHONY: run-android-local
run-android-local: ## ローカルで Android ビルド実行
	cd apps/mobile && eas build --platform android --local