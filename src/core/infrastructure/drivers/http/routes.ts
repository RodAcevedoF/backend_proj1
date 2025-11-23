import type { Express } from 'express';
import { makeArticleDependencies } from '@/features/article/dependencies';
import { createArticleRouter } from '@/features/article/infrastructure/driver/http/routes';

export function registerRoutes(app: Express) {
  const articleDeps = makeArticleDependencies();

  app.use('/articles', createArticleRouter(articleDeps.articleController));
}
