import { Request, Response } from 'express';
import { RedisTokenService } from '@/core/infrastructure/adapters/RedisTokenService';

/**
 * Session Management Controller
 * Handles session-related operations for logged-in users
 */
export class SessionController {
  constructor(private readonly tokenService: RedisTokenService) {}

  /**
   * GET /sessions
   * Get all active sessions for current user
   */
  async getMySessions(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      const sessionIds = await this.tokenService.getUserSessions(
        req.user.userId
      );

      return res.status(200).json({
        message: 'Active sessions retrieved',
        data: {
          count: sessionIds.length,
          sessions: sessionIds,
          currentSession: req.sessionId,
        },
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve sessions',
      });
    }
  }

  /**
   * DELETE /sessions
   * Logout from all devices
   */
  async logoutAllDevices(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
      }

      await this.tokenService.deleteUserSessions(req.user.userId);

      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      return res.status(200).json({
        message: 'Logged out from all devices',
      });
    } catch (error) {
      console.error('Logout all devices error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to logout from all devices',
      });
    }
  }

  /**
   * GET /sessions/stats
   * Get session statistics (admin only)
   */
  async getSessionStats(_req: Request, res: Response): Promise<Response> {
    try {
      const stats = await this.tokenService.getSessionStats();

      return res.status(200).json({
        message: 'Session statistics',
        data: stats,
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve session statistics',
      });
    }
  }
}
