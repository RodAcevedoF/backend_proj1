import type { Express } from 'express';
import { bootstrap } from '@/core/bootstrap';
import { makeArticleDependencies } from '@/features/article/dependencies';
import { createArticleRouter } from '@/features/article/infrastructure/adapters/driver/http/routes';
import { createAuthRoutes } from '@/features/users/infrastructure/http/auth.routes';
import { createWorkspaceRoutes } from '@/features/workspaces/infrastructure/http/workspace.routes';
import { createRoadmapRoutes } from '@/features/roadmap/infrastructure/http/roadmap.routes';
import { LogoutController } from '@/features/users/infrastructure/http/logout.controller';
import { WorkspaceController } from '@/features/workspaces/infrastructure/http/workspace.controller';
import { AuthMiddleware } from '@/core/infrastructure/driven/http/middleware/auth.middleware';
import { AuthorizationMiddleware } from '@/core/infrastructure/driven/http/middleware/authorization.middleware';

export function registerRoutes(app: Express) {
  const BASE = process.env.API_BASE || '/sagepoint/api/v1';

  // Bootstrap all dependencies
  const deps = bootstrap({
    sessionDurationHours: parseInt(process.env.SESSION_DURATION_HOURS || '24'),
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    redisUrl: process.env.REDIS_URL,
  });

  // Shared middlewares
  const authMiddleware = new AuthMiddleware(deps.shared.tokenService);
  const authzMiddleware = new AuthorizationMiddleware(deps.workspaces.workspaceRepository);

  // Article (self-contained)
  const articleDeps = makeArticleDependencies();
  app.use(`${BASE}/articles`, createArticleRouter(articleDeps.articleController));

  // Auth
  const logoutController = new LogoutController(deps.shared.tokenService);
  app.use(`${BASE}/auth`, createAuthRoutes({
    authController: deps.users.authController,
    logoutController,
    tokenService: deps.shared.tokenService,
    authMiddleware,
  }));

  // Workspaces
  const workspaceController = new WorkspaceController(
    deps.workspaces.createWorkspaceUseCase,
    deps.workspaces.inviteMemberUseCase
  );
  app.use(`${BASE}/workspaces`, createWorkspaceRoutes({
    workspaceController,
    authMiddleware,
    authzMiddleware,
  }));

  // Roadmaps
  app.use(`${BASE}`, createRoadmapRoutes({
    roadmapController: deps.roadmaps.roadmapController,
    authMiddleware,
    authzMiddleware,
  }));
}
