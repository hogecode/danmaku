import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { OAuthState } from './oauth-state.interface';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class OAuthStateService {
  private readonly REDIS_PREFIX = 'oauth_state:';
  private readonly TTL_SECONDS = 10 * 60; // 10分

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly logger: LoggerService,
  ) {}

  /**
   * OAuthState を生成して Redis に保存
   */
  async generateAndSaveState(
    purpose: 'login' | 'drive_connection',
    provider: string,
    userId?: bigint,
    codeVerifier?: string,
  ): Promise<string> {
    const state = this.generateRandomState();
    
    const oauthState: OAuthState = {
      purpose,
      provider,
      userId,
      timestamp: Date.now(),
      codeVerifier,
    };

    const key = `${this.REDIS_PREFIX}${state}`;
    
    try {
      await this.redis.setex(
        key,
        this.TTL_SECONDS,
        JSON.stringify(oauthState),
      );
      
      this.logger.debug(`[OAuthStateService] State saved: ${state}`, {
        purpose,
        provider,
      });
      
      return state;
    } catch (error) {
      this.logger.error('[OAuthStateService] Failed to save state', error as Error);
      throw new BadRequestException('Failed to generate OAuth state');
    }
  }

  /**
   * Redis から state を取得・検証
   */
  async getAndValidateState(state: string): Promise<OAuthState> {
    const key = `${this.REDIS_PREFIX}${state}`;
    
    try {
      const data = await this.redis.get(key);
      
      if (!data) {
        throw new BadRequestException('Invalid or expired state parameter');
      }

      const oauthState = JSON.parse(data) as OAuthState;
      
      const ageMs = Date.now() - oauthState.timestamp;
      if (ageMs > this.TTL_SECONDS * 1000) {
        await this.redis.del(key);
        throw new BadRequestException('State has expired');
      }

      this.logger.debug(`[OAuthStateService] State validated: ${state}`, {
        purpose: oauthState.purpose,
        provider: oauthState.provider,
      });

      return oauthState;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('[OAuthStateService] State validation failed', error as Error);
      throw new BadRequestException('State validation failed');
    }
  }

  /**
   * Redis から state を削除
   */
  async deleteState(state: string): Promise<void> {
    const key = `${this.REDIS_PREFIX}${state}`;
    try {
      await this.redis.del(key);
      this.logger.debug(`[OAuthStateService] State deleted: ${state}`);
    } catch (error) {
      this.logger.error('[OAuthStateService] Failed to delete state', error as Error);
    }
  }

  /**
   * ランダムな state 値を生成
   */
  private generateRandomState(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let state = '';
    const randomValues = new Uint8Array(64);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < 64; i++) {
      state += chars[randomValues[i] % chars.length];
    }
    
    return state;
  }
}
