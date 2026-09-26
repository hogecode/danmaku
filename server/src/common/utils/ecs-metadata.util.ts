import axios from 'axios';
import { pinoLogger } from '../logger/pino.logger';

/**
 * ECS Task Metadata API から タスク定義リビジョン番号を取得
 * 
 * Fargate の各コンテナには ECS_CONTAINER_METADATA_URI_V4 環境変数が
 * 自動的に設定されており、これを使用してメタデータにアクセス可能
 * 
 * @returns タスク定義リビジョン番号 (例: "71") または "unknown"
 */
export async function getTaskDefinitionRevision(): Promise<string> {
  try {
    const metadataUri = process.env.ECS_CONTAINER_METADATA_URI_V4;

    // ECS 環境でない場合（ローカル開発など）
    if (!metadataUri) {
      pinoLogger.debug('Not running on ECS Fargate - using default task revision');
      return 'local';
    }

    // ECS Task Metadata API v4 からタスク情報を取得
    const response = await axios.get(`${metadataUri}/task`);
    const taskMetadata = response.data;

    // taskDefinitionArn 例:
    // "arn:aws:ecs:ap-northeast-1:123456789:task-definition/danmaku-nestjs:71"
    // 末尾の番号がリビジョン番号
    const taskDefinitionArn = taskMetadata.TaskDefinitionArn as string;
    const revision = taskDefinitionArn.split(':').pop() || 'unknown';

    pinoLogger.info(
      {
        taskDefinitionArn,
        revision,
        taskArn: taskMetadata.TaskArn,
      },
      '✅ ECS Task Metadata retrieved successfully',
    );

    return revision;
  } catch (error) {
    pinoLogger.warn(
      { err: error instanceof Error ? error : new Error(String(error)) },
      '⚠️ Failed to retrieve ECS task definition revision',
    );
    return 'unknown';
  }
}
