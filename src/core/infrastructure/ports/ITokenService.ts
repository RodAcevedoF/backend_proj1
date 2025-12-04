/**
 * Session Data
 */
export interface SessionData {
  userId: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Token Service Port (Outbound)
 * Abstract interface for session and token operations
 */
export interface ITokenService {
  /**
   * Create a new session
   */
  createSession(payload: { userId: string; email: string }): Promise<string>; // Returns sessionId

  /**
   * Get session data by sessionId
   */
  getSession(sessionId: string): Promise<SessionData | null>;

  /**
   * Delete session
   */
  deleteSession(sessionId: string): Promise<void>;

  /**
   * Refresh session (extend expiration)
   */
  refreshSession(sessionId: string): Promise<boolean>;

  /**
   * Clean up expired sessions
   */
  cleanExpiredSessions(): Promise<void>;
}
