import { Router } from 'express';
import { ArticleController } from './article.http.controller';

export function createArticleRouter(ctrl: ArticleController) {
  const router = Router();

  router.post('/', ctrl.create);
  router.get('/:id', ctrl.getById);
  return router;
}
