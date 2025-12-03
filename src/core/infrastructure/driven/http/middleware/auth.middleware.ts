import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../../ports/ITokenService';

// Extend Express Request to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      sessionId?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies session from secure HTTP-only cookie
 *
 * Follows Single Responsibility Principle - only handles authentication
 */
export class AuthMiddleware {
  private readonly cookieName: string = 'sessionId';

  constructor(private readonly tokenService: ITokenService) {}

  /**
   * Verify session from cookie and attach user to request
   */
  authenticate() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Get session ID from cookie
        const sessionId = req.cookies?.[this.cookieName];

        if (!sessionId) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'No active session',
          });
        }

        // Verify session
        const session = await this.tokenService.getSession(sessionId);

        if (!session) {
          // Clear invalid cookie
          res.clearCookie(this.cookieName);
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired session',
          });
        }

        // Attach user and sessionId to request
        req.user = {
          userId: session.userId,
          email: session.email,
        };
        req.sessionId = sessionId;

        // Refresh session on each request (sliding expiration)
        await this.tokenService.refreshSession(sessionId);

        next();
      } catch {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication failed',
        });
      }
    };
  }

  /**
   * Optional authentication - doesn't fail if no session
   */
  optionalAuth() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sessionId = req.cookies?.[this.cookieName];

        if (sessionId) {
          const session = await this.tokenService.getSession(sessionId);

          if (session) {
            req.user = {
              userId: session.userId,
              email: session.email,
            };
            req.sessionId = sessionId;
            // Refresh session
            await this.tokenService.refreshSession(sessionId);
          }
        }

        next();
      } catch {
        // Continue without user
        next();
      }
    };
  }
}
