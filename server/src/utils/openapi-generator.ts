import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * OpenAPI ドキュメントを生成してYAMLファイルとして保存する
 */
export async function generateOpenAPIYaml(
  app: INestApplication,
  outputPath: string = 'openapi.yaml',
): Promise<void> {
  try {
    // Swagger設定
    const config = new DocumentBuilder()
      .setTitle('danmaku API')
      .setDescription('Danmaku API documentation')
      .setVersion('1.0')
      .build();

    // OpenAPIドキュメント（JSON形式）を生成
    const document = SwaggerModule.createDocument(app, config);

    // JSONをYAMLに変換
    const yamlContent = yaml.dump(document, {
      lineWidth: -1,
      noRefs: true,
    });

    // ファイルパスを解決（絶対パスまたはプロジェクトルートから）
    const resolvedPath = path.isAbsolute(outputPath)
      ? outputPath
      : path.join(process.cwd(), outputPath);

    // ディレクトリがなければ作成
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // YAML ファイルに保存
    fs.writeFileSync(resolvedPath, yamlContent, 'utf-8');

    console.log(`✅ OpenAPI YAML generated: ${resolvedPath}`);
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI YAML:', error);
    throw error;
  }
}