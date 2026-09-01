
## ========================
## API コード生成 (Windows用)
## ========================
generate-api-client: ## Axios TypeScriptクライアント生成
	powershell -Command "docker run --rm -v \"$${PWD}:/local\" openapitools/openapi-generator-cli:latest generate -i /local/server/openapi.yaml -g typescript-axios -o /local/apps/web/lib/generated --additional-properties=typescriptThreePlus=true,supportsES6=true,hideGenerationTimestamp=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis"


run-mobile: ## Flutterアプリを起動する
	cd apps/mobile/flutter_app && flutter run -d chrome