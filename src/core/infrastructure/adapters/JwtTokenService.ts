import { randomUUID } from 'crypto';
import { ITokenService, SessionData } from '../../domain/ports/ITokenService';

/**
 * In-Memory Session Store
 * For production, use Redis or database-backed sessions
 */
class SessionStore {
  private sessions: Map<string, SessionData> = new Map();

  set(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
  }

  get(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanExpired(): void {
    const now = new Date();
    for (const [sessionId, data] of this.sessions.entries()) {
      if (data.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

/**
 * Session-based Token Service
 * Implements secure session management with in-memory storage
 * TODO: For production, replace with Redis-backed sessions
 */
export class SessionTokenService implements ITokenService {
  private readonly sessionStore: SessionStore;
  private readonly sessionDuration: number; // in milliseconds

  constructor(sessionDurationHours: number = 24) {
    this.sessionStore = new SessionStore();
    this.sessionDuration = sessionDurationHours * 60 * 60 * 1000;

    // Clean expired sessions every hour
    setInterval(
      () => {
        this.cleanExpiredSessions();
      },
      60 * 60 * 1000
    );
  }

  async createSession(payload: {
    userId: string;
    email: string;
  }): Promise<string> {
    const sessionId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.sessionDuration);

    const sessionData: SessionData = {
      userId: payload.userId,
      email: payload.email,
      createdAt: now,
      expiresAt,
    };

    this.sessionStore.set(sessionId, sessionData);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.sessionStore.delete(sessionId);
      return null;
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessionStore.delete(sessionId);
  }

  async refreshSession(sessionId: string): Promise<boolean> {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      return false;
    }

    // Extend expiration
    const now = new Date();
    session.expiresAt = new Date(now.getTime() + this.sessionDuration);
    this.sessionStore.set(sessionId, session);

    return true;
  }

  async cleanExpiredSessions(): Promise<void> {
    this.sessionStore.cleanExpired();
  }
}
