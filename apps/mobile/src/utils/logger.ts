/**
 * ロギングユーティリティ
 * Flutter の appLogger を TypeScript/React Native に適応
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

class Logger {
  private prefix = '[Danmaku]';

  private formatLog(level: LogLevel, message: string, error?: unknown): string {
    const timestamp = new Date().toISOString();
    let logMessage = `${this.prefix} [${level}] ${timestamp} - ${message}`;
    
    if (error) {
      if (error instanceof Error) {
        logMessage += `\n  Error: ${error.message}\n  Stack: ${error.stack}`;
      } else {
        logMessage += `\n  Error: ${JSON.stringify(error)}`;
      }
    }
    
    return logMessage;
  }

  debug(message: string) {
    console.log(this.formatLog('DEBUG', message));
  }

  info(message: string) {
    console.log(this.formatLog('INFO', message));
  }

  warning(message: string, error?: unknown) {
    console.warn(this.formatLog('WARNING', message, error));
  }

  error(message: string, error?: unknown) {
    console.error(this.formatLog('ERROR', message, error));
  }
}

export const appLogger = new Logger();
