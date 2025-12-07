import { Router, RequestHandler } from 'express';
import { AuthController } from './auth.controller';
import { LogoutController } from './logout.controller';
import { SessionController } from './session.controller';
import { ITokenService } from '@/core/domain/ports/ITokenService';
import { RedisTokenService } from '@/core/infrastructure/adapters/RedisTokenService';

export type AuthRouteDeps = {
  authController: AuthController;
  logoutController: LogoutController;
  tokenService: ITokenService;
  authMiddleware: { authenticate: () => RequestHandler };
};

export function createAuthRoutes(deps: AuthRouteDeps): Router {
  const router = Router();

  const { authController, logoutController, tokenService, authMiddleware } =
    deps;

  // Session controller only available if using Redis
  let sessionController: SessionController | null = null;
  if (tokenService instanceof RedisTokenService) {
    sessionController = new SessionController(tokenService);
  }

  // Email/password auth
  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/logout', authMiddleware.authenticate(), (req, res) =>
    logoutController.logout(req, res)
  );

  // Email verification
  router.get('/verify-email', (req, res) =>
    authController.verifyEmail(req, res)
  );
  router.post('/resend-verification', (req, res) =>
    authController.resendVerification(req, res)
  );

  // Google OAuth
  router.get('/google', (req, res) => authController.googleAuth(req, res));
  router.get('/google/callback', (req, res) =>
    authController.googleCallback(req, res)
  );

  // Password reset
  router.post('/forgot-password', (req, res) =>
    authController.forgotPassword(req, res)
  );
  router.post('/reset-password', (req, res) =>
    authController.resetPassword(req, res)
  );

  // Session management
  if (sessionController) {
    router.get('/sessions', authMiddleware.authenticate(), (req, res) =>
      sessionController!.getMySessions(req, res)
    );
    router.delete('/sessions', authMiddleware.authenticate(), (req, res) =>
      sessionController!.logoutAllDevices(req, res)
    );
    router.get('/sessions/stats', authMiddleware.authenticate(), (req, res) =>
      sessionController!.getSessionStats(req, res)
    );
  }

  return router;
}
