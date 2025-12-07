import { Router, RequestHandler } from 'express';
import { AuthController } from './auth.controller';
import { LogoutController } from './logout.controller';
import { SessionController } from './session.controller';
import { ITokenService } from '@/core/infrastructure/ports/ITokenService';
import { RedisTokenService } from '@/core/infrastructure/adapters/RedisTokenService';

export type AuthRouteDeps = {
  authController: AuthController;
  logoutController: LogoutController;
  tokenService: ITokenService;
  authMiddleware: { authenticate: () => RequestHandler };
};

export function createAuthRoutes(deps: AuthRouteDeps): Router {
  const router = Router();

  const { authController, logoutController, tokenService, authMiddleware } = deps;

  // Session controller only available if using Redis
  let sessionController: SessionController | null = null;
  if (tokenService instanceof RedisTokenService) {
    sessionController = new SessionController(tokenService);
  }

  router.post('/register', (req, res) => authController.register(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/logout', authMiddleware.authenticate(), (req, res) =>
    logoutController.logout(req, res)
  );

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
