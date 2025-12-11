import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '@/core/domain/ports/ITokenService';

import { Role } from '@/core/domain/Role';

// Extend Express Request globally
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
      /** Workspace context - populated by authorization middleware */
      workspace?: {
        workspaceId: string;
        role: Role;
      };
      sessionId?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies session from secure HTTP-only cookie
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
        const sessionId = req.cookies?.[this.cookieName];

        if (!sessionId) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'No active session',
          });
        }

        const session = await this.tokenService.getSession(sessionId);

        if (!session) {
          res.clearCookie(this.cookieName);
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired session',
          });
        }

        req.user = {
          userId: session.userId,
          email: session.email,
        };
        req.sessionId = sessionId;

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
            await this.tokenService.refreshSession(sessionId);
          }
        }

        next();
      } catch {
        next();
      }
    };
  }
}
