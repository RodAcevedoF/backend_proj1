import type { Express } from 'express';
import { makeArticleDependencies } from '@/features/article/dependencies';
import { createArticleRouter } from '@/features/article/infrastructure/adapters/driver/http/routes';

export function registerRoutes(app: Express) {
  const BASE = process.env.API_BASE || '/sagepoint/api/v1';
  const articleDeps = makeArticleDependencies();

  app.use(
    `${BASE}/article`,
    createArticleRouter(articleDeps.articleController)
  );
}
