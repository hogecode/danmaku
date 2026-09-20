/**
 * Secret Parser Utility
 * 
 * Parses secrets from environment variables (either as JSON from Secrets Manager
 * or individual env vars for local development).
 * 
 * Supports:
 *   1. JSON secrets from AWS Secrets Manager
 *   2. Individual environment variables for local development
 *   3. Hybrid mode (JSON + env var fallback)
 * 
 * Example:
 *   // RDS Credentials (JSON from Secrets Manager)
 *   process.env.DB_CREDENTIALS = JSON string with username, password, host, etc.
 *   
 *   // Redis Credentials (JSON from Secrets Manager)
 *   process.env.REDIS_CREDENTIALS = JSON string with host, port, password, db
 *   
 *   // App Secrets (JSON from Secrets Manager)
 *   process.env.APP_SECRETS = JSON string with jwt_secret, session_secret, etc.
 *   
 *   // Fallback to individual env vars
 *   process.env.JWT_SECRET = '...'
 *   process.env.SESSION_SECRET = '...'
 */

/**
 * Parse JSON secret string into an object
 * Returns the parsed object or undefined if parsing fails
 * 
 * @param jsonSecret - JSON secret string from environment variable
 * @returns The parsed object or undefined if parsing fails
 * 
 * Example:
 *   const dbSecrets = parseSecret(process.env.DB_CREDENTIALS);
 *   if (dbSecrets) {
 *     console.log(dbSecrets.username, dbSecrets.password);
 *   }
 */
export function parseSecret(
  jsonSecret: string | undefined,
): Record<string, any> | undefined {
  if (!jsonSecret) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(jsonSecret);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse JSON secret:', error);
  }

  return undefined;
}

/**
 * Get value from JSON secret or fallback to individual env var
 * 
 * @param jsonSecret - JSON secret string from environment variable
 * @param jsonKey - Key to extract from the JSON object
 * @param envVarName - Fallback environment variable name
 * @returns The value from JSON secret or env var, or undefined
 * 
 * Example:
 *   const jwtSecret = getSecretValue(
 *     process.env.APP_SECRETS,
 *     'jwt_secret',
 *     'JWT_SECRET'
 *   );
 *   
 *   const redisHost = getSecretValue(
 *     process.env.REDIS_CREDENTIALS,
 *     'host',
 *     'REDIS_HOST'
 *   ) || 'localhost';
 */
export function getSecretValue(
  jsonSecret: string | undefined,
  jsonKey: string,
  envVarName: string,
): string | undefined {
  // 1. Parse from JSON secret
  if (jsonSecret) {
    try {
      const parsed = JSON.parse(jsonSecret);
      if (typeof parsed === 'object' && parsed !== null && jsonKey in parsed) {
        const value = parsed[jsonKey];
        return typeof value === 'string' ? value : String(value);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error(`Failed to parse JSON secret for ${jsonKey}:`, error);
      }
    }
  }

  // 2. Fallback to individual environment variable
  const envVal = process.env[envVarName];
  return envVal;
}
