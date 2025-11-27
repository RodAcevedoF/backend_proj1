import { Router } from 'express';
import { ArticleController } from './article.http.controller';
import { CreateArticleSchema } from './validators/create-article.validator';
import { validateBody } from '@/core/infrastructure/drivers/http/middleware/validate';

export function createArticleRouter(ctrl: ArticleController) {
  const router = Router();

  router.post('/', validateBody(CreateArticleSchema), ctrl.create);
  router.get('/:id', ctrl.getById);
  return router;
}
