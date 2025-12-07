import { Router } from 'express';
import { ArticleController } from './article.http.controller';
import { CreateArticleSchema } from './validators/create-article.validator';
import { validateBody } from '@/core/infrastructure/drivers/http/middleware/validate';

export function createArticleRouter(ctrl: ArticleController) {
  const router = Router();

  // External routes must come before :id to avoid conflicts
  router.get('/external/search', ctrl.searchExternal);
  router.post('/external/import', ctrl.importExternal);

  router.post('/', validateBody(CreateArticleSchema), ctrl.create);
  router.get('/:id', ctrl.getById);

  return router;
}
