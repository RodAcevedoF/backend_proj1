import { createClient, RedisClientType } from 'redis';
import { randomUUID } from 'crypto';
import { ITokenService, SessionData } from '../ports/ITokenService';

/**
 * Redis-backed Session Token Service
 * Production-ready session management with Redis
 *
 * Benefits:
 * - Persistent sessions across server restarts
 * - Horizontal scalability (multiple server instances)
 * - Automatic expiration with Redis TTL
 * - High performance with in-memory storage
 */
export class RedisTokenService implements ITokenService {
  private client: RedisClientType;
  private readonly sessionDuration: number; // in seconds
  private readonly keyPrefix: string = 'session:';

  constructor(
    redisUrl: string = 'redis://localhost:6379',
    sessionDurationHours: number = 24
  ) {
    this.client = createClient({ url: redisUrl });
    this.sessionDuration = sessionDurationHours * 60 * 60; // Convert to seconds

    // Connect to Redis
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('✅ Connected to Redis for session management');

      // Handle Redis errors
      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Reconnecting to Redis...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis client ready');
      });
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Create a new session
   * Stores session data in Redis with automatic expiration
   */
  async createSession(payload: {
    userId: string;
    email: string;
  }): Promise<string> {
    const sessionId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionDuration * 1000);

    const sessionData: SessionData = {
      userId: payload.userId,
      email: payload.email,
      createdAt: now,
      expiresAt,
    };

    // Store in Redis with TTL (Time To Live)
    const key = this.keyPrefix + sessionId;
    await this.client.setEx(
      key,
      this.sessionDuration,
      JSON.stringify(sessionData)
    );

    return sessionId;
  }

  /**
   * Get session data by sessionId
   * Returns null if session doesn't exist or is expired
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = this.keyPrefix + sessionId;
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    try {
      const sessionData: SessionData = JSON.parse(data);

      // Parse dates (JSON doesn't preserve Date objects)
      sessionData.createdAt = new Date(sessionData.createdAt);
      sessionData.expiresAt = new Date(sessionData.expiresAt);

      // Double-check expiration (Redis TTL should handle this, but defensive)
      if (sessionData.expiresAt < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }

  /**
   * Delete session
   * Immediately invalidates the session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = this.keyPrefix + sessionId;
    await this.client.del(key);
  }

  /**
   * Refresh session (extend expiration)
   * Implements sliding expiration - session extends on each request
   */
  async refreshSession(sessionId: string): Promise<boolean> {
    const key = this.keyPrefix + sessionId;

    // Check if session exists
    const exists = await this.client.exists(key);
    if (!exists) {
      return false;
    }

    // Extend TTL
    await this.client.expire(key, this.sessionDuration);
    return true;
  }

  /**
   * Clean up expired sessions
   * Redis handles this automatically with TTL, so this is a no-op
   * Included for interface compatibility
   */
  async cleanExpiredSessions(): Promise<void> {
    // Redis automatically removes expired keys
    // No action needed
    return;
  }

  /**
   * Get all active sessions for a user
   * Useful for "logout from all devices" functionality
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const pattern = `${this.keyPrefix}*`;
    const sessionIds: string[] = [];

    // Scan for all session keys
    for await (const maybeKey of this.client.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      // scanIterator can yield string or string[] depending on the client; normalize to an array
      const keysToCheck = Array.isArray(maybeKey) ? maybeKey : [maybeKey];
      for (const key of keysToCheck) {
        const data = await this.client.get(key);
        if (data) {
          try {
            const sessionData: SessionData = JSON.parse(data);
            if (sessionData.userId === userId) {
              sessionIds.push(key.replace(this.keyPrefix, ''));
            }
          } catch {
            // Skip invalid session data
          }
        }
      }
    }

    return sessionIds;
  }

  /**
   * Delete all sessions for a user
   * Implements "logout from all devices"
   */
  async deleteUserSessions(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessions(userId);

    if (sessionIds.length > 0) {
      const keys = sessionIds.map((id) => this.keyPrefix + id);
      await this.client.del(keys);
    }
  }

  /**
   * Get session statistics
   * Useful for monitoring and debugging
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    memoryUsage: string;
  }> {
    const pattern = `${this.keyPrefix}*`;
    let count = 0;

    // Count all session keys
    for await (const maybeKey of this.client.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      // normalize to determine how many actual keys were returned by the iterator
      const keysFound = Array.isArray(maybeKey) ? maybeKey.length : 1;
      count += keysFound;
    }

    const info = await this.client.info('memory');
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';

    return {
      totalSessions: count,
      memoryUsage,
    };
  }

  /**
   * Disconnect from Redis
   * Should be called on graceful shutdown
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('✅ Disconnected from Redis');
  }
}
