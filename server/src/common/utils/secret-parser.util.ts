/**
 * Secret Parser Utility
 * 
 * Parses secrets from environment variables (either as JSON from Secrets Manager
 * or individual env vars for local development).
 * 
 * Example:
 *   process.env.APP_SECRETS = '{"jwt_secret":"...","session_secret":"..."}'
 *   OR
 *   process.env.JWT_SECRET = '...'
 *   process.env.SESSION_SECRET = '...'
 */


/**
 * Get value from JSON secret or fallback to individual env var
 */
/**
 * JSONシークレットからキー指定で値を取得し、なければ個別の環境変数にフォールバックする
 */
export function getSecretValue(
  jsonSecret: string | undefined,
  jsonKey: string,
  envVarName: string,
): string | undefined {
  // 1. JSONシークレットからの取得を試みる
  if (jsonSecret) {
    try {
      const parsed = JSON.parse(jsonSecret);
      // 'key in object' でプロパティの存在チェック（0やfalseも正しく許容）
      if (typeof parsed === 'object' && parsed !== null && jsonKey in parsed) {
        return parsed[jsonKey];
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error(`⚠️ Failed to parse JSON secret for ${jsonKey}:`, error);
      }
    }
  }

  // 2. 個別の環境変数にフォールバック
  const envVal = process.env[envVarName];
  return envVal;
}
