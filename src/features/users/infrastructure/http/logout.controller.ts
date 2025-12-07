import { Request, Response } from 'express';
import { ITokenService } from '@/core/infrastructure/ports/ITokenService';

/**
 * Logout Controller
 * Handles session termination
 */
export class LogoutController {
  constructor(private readonly tokenService: ITokenService) {}

  /**
   * POST /auth/logout
   * Terminate current session
   */
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const sessionId = req.sessionId;

      if (sessionId) {
        // Delete session from store
        await this.tokenService.deleteSession(sessionId);
      }

      // Clear session cookie
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to logout',
      });
    }
  }
}
