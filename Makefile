## ========================
## API コード生成 (Windows用)
## ========================

.PHONY: generate-web-client
generate-web-client: ## Axios TypeScriptクライアント生成 (Web用)
	powershell -Command "$$pwd = pwd; docker run --rm -v \"$$pwd`:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g typescript-axios -o /local/apps/web/lib/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis"

.PHONY: generate-mobile-client
generate-mobile-client: ## TypeScript Fetch クライアント生成 (React Native/Expo用)
	powershell -Command "$$pwd = pwd; docker run --rm -v \"$$pwd`:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g typescript-fetch -o /local/apps/mobile/src/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis"

.PHONY: generate-flutter-client
generate-flutter-client: ## Dart OpenAPIクライアント生成 (Flutter用 - Docker使用)
	powershell -Command "$$pwd = pwd; docker run --rm -v \"$$pwd`:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g dart -o /local/apps/desktop/lib/data/client --additional-properties=hideGenerationTimestamp=true,pubName=desktop,pubVersion=1.0.0"

.PHONY: generate-msw
generate-msw: ## MSW ハンドラー生成 (Web用 - OpenAPI → MSW自動生成)
	powershell -Command "cd apps/web; npx msw-auto-mock '../../server/openapi.yaml' -o mocks"

.PHONY: generate-all-clients
generate-all-clients: generate-web-client generate-mobile-client generate-flutter-client generate-msw ## すべてのクライアント生成 (Web + Mobile + Flutter + MSW)
	@echo "All clients generated successfully!"


## ========================
## Storybook関連 (Windows用)
## ========================
.PHONY: storybook-dev
storybook-dev: ## Storybook 開発サーバー起動 (ポート6006)
	cd apps/web && npm run storybook

.PHONY: storybook-build
storybook-build: ## Storybook 本番向けビルド
	cd apps/web && npm run build-storybook


## ========================
## ビルド関連 (Windows用)
## ========================
# desktop (Flutter)
.PHONY: flutter-build-runner
flutter-build-runner: ## Flutter build_runner 実行
	cd apps/desktop && flutter pub run build_runner build --delete-conflicting-outputs

# mobile (React Native/Expo)
.PHONY: run-android-local
run-android-local: ## ローカルで Android ビルド実行
	cd apps/mobile && eas build --platform android --local


## ========================
## Terraform関連 (Windows用)
## ========================
.PHONY: tf.init
tf.init:
	cd infra/terraform && terraform init -input=false

.PHONY: tf.plan.prod
tf.plan.prod: ## Prod環境のTerraform計画を実行
	@echo "Running Terraform plan for prod environment..."
	@cd infra/terraform && terraform plan -var-file="environments/prod.tfvars" -out=tfplan

.PHONY: tf.apply.prod
tf.apply.prod: ## Prod環境のTerraform変更を適用
	@echo "Applying Terraform changes for prod environment..."
	@cd infra/terraform && terraform apply tfplan

.PHONY: tf.destroy.prod
tf.destroy.prod: ## Prod環境のTerraformリソースを破棄
	@echo "Destroying Terraform resources for prod environment..."
	@cd infra/terraform && terraform destroy -var-file="environments/prod.tfvars" -auto-approve