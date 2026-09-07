import { S3Event, S3EventRecord, S3Handler } from 'aws-lambda';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// 許可されたファイルの MIME タイプ
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
];

// 最大ファイルサイズ（バイト単位）
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ファイル形式と最大サイズを検証する関数
async function validateFile(bucket: string, key: string): Promise<{
  isValid: boolean;
  message: string;
  fileSize?: number;
  contentType?: string;
}> {
  try {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(headObjectCommand);
    const contentType = response.ContentType || 'unknown';
    const fileSize = response.ContentLength || 0;

    // ファイルサイズチェック
    if (fileSize > MAX_FILE_SIZE) {
      return {
        isValid: false,
        message: `ファイルサイズが大きすぎます: ${fileSize} bytes (上限: ${MAX_FILE_SIZE} bytes)`,
        fileSize,
        contentType,
      };
    }

    // ファイル形式チェック
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return {
        isValid: false,
        message: `許可されていないファイル形式です: ${contentType}`,
        fileSize,
        contentType,
      };
    }

    return {
      isValid: true,
      message: `ファイルの検証に成功しました`,
      fileSize,
      contentType,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      isValid: false,
      message: `ファイルの取得に失敗しました: ${errorMessage}`,
    };
  }
}

// S3イベントを処理するメインハンドラー
export const handler: S3Handler = async (event: S3Event) => {
  console.log('S3 Validation Lambda triggered');
  console.log(JSON.stringify(event, null, 2));

  const results = [];

  // 各S3イベントレコードを処理
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing file: s3://${bucket}/${key}`);

    // ファイル検証を実行
    const validationResult = await validateFile(bucket, key);

    // 検証結果をログ出力
    if (validationResult.isValid) {
      console.log(`✅ VALID: ${key} (Size: ${validationResult.fileSize} bytes, Type: ${validationResult.contentType})`);
    } else {
      console.warn(`❌ INVALID: ${key} - ${validationResult.message}`);
    }

    results.push({
      bucket,
      key,
      ...validationResult,
    });
  }

  // 最終結果をログ出力
  const allValid = results.every((result) => result.isValid);
  console.log(`\nValidation Summary: ${results.filter((r) => r.isValid).length}/${results.length} files valid`);
  console.log(JSON.stringify({
    message: allValid ? 'All files are valid' : 'Some files are invalid',
    results,
  }));
};
