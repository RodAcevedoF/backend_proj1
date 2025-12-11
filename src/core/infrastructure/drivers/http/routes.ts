import type { Express } from 'express';
import { bootstrap } from '@/core/bootstrap';
import { createArticleRouter } from '@/features/article/infrastructure/adapters/driver/http/routes';
import { createAuthRoutes } from '@/features/users/infrastructure/adapters/driver/http/auth.routes';
import { createWorkspaceRoutes } from '@/features/workspaces/infrastructure/adapters/driver/http/workspace.routes';
import { createRoadmapRoutes } from '@/features/roadmap/infrastructure/adapters/driver/http/roadmap.routes';
import { createCategoryRoutes } from '@/features/category/infrastructure/adapters/driver/http/category.routes';
import { LogoutController } from '@/features/users/infrastructure/adapters/driver/http/logout.controller';
import { AuthMiddleware, AuthorizationMiddleware } from './middleware';

export function registerRoutes(app: Express) {
  const BASE = process.env.API_BASE || '/sagepoint/api/v1';

  // Bootstrap all dependencies
  const deps = bootstrap({
    sessionDurationHours: parseInt(process.env.SESSION_DURATION_HOURS || '24'),
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    redisUrl: process.env.REDIS_URL,
    appUrl: process.env.APP_URL,
    frontendUrl: process.env.FRONTEND_URL,
    smtp: process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
          from: process.env.SMTP_FROM || 'noreply@sagepoint.com',
        }
      : undefined,
    supabase: process.env.SUPABASE_URL
      ? {
          url: process.env.SUPABASE_URL,
          anonKey: process.env.SUPABASE_ANON_KEY || '',
        }
      : undefined,
  });

  // Shared middlewares
  const authMiddleware = new AuthMiddleware(deps.shared.tokenService);
  const authzMiddleware = new AuthorizationMiddleware(
    deps.workspaces.workspaceRepository
  );

  // Articles
  app.use(
    `${BASE}/articles`,
    createArticleRouter({
      ctrl: deps.articles.articleController,
      authMiddleware,
      authzMiddleware,
    })
  );

  // Auth
  const logoutController = new LogoutController(deps.shared.tokenService);
  app.use(
    `${BASE}/auth`,
    createAuthRoutes({
      authController: deps.users.authController,
      logoutController,
      tokenService: deps.shared.tokenService,
      authMiddleware,
    })
  );

  // Workspaces
  app.use(
    `${BASE}/workspaces`,
    createWorkspaceRoutes({
      workspaceController: deps.workspaces.workspaceController,
      authMiddleware,
      authzMiddleware,
    })
  );

  // Categories (nested under workspaces)
  app.use(
    `${BASE}/workspaces/:workspaceId/categories`,
    createCategoryRoutes({
      ctrl: deps.categories.categoryController,
      authMiddleware,
      authzMiddleware,
    })
  );

  // Roadmaps
  app.use(
    `${BASE}`,
    createRoadmapRoutes({
      roadmapController: deps.roadmaps.roadmapController,
      authMiddleware,
      authzMiddleware,
    })
  );
}
