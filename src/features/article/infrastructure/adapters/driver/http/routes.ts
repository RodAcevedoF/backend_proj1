import { Router, RequestHandler } from 'express';
import { ArticleController } from './article.http.controller';
import { CreateArticleSchema } from './validators/create-article.validator';
import { validateBody, uploadMiddleware } from '@/core/infrastructure/drivers/http/middleware';

const SPREADSHEET_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export type ArticleRouteDeps = {
  ctrl: ArticleController;
  authMiddleware: { authenticate: () => RequestHandler };
  authzMiddleware: { requireWorkspaceEditor: (param?: string) => RequestHandler };
};

export function createArticleRouter(deps: ArticleRouteDeps) {
  const { ctrl, authMiddleware, authzMiddleware } = deps;
  const router = Router();

  const auth = authMiddleware.authenticate();
  const editorInWorkspace = authzMiddleware.requireWorkspaceEditor();

  // ============ SPECIFIC PATHS FIRST (before :id param) ============

  // Search external sources (authenticated)
  router.get('/external/search', auth, ctrl.searchExternal);

  // Import from external source (requires editor role in workspace)
  router.post('/external/import', auth, editorInWorkspace, ctrl.importExternal);

  // File import (requires editor role in workspace)
  router.post(
    '/import',
    auth,
    editorInWorkspace,
    uploadMiddleware.single({
      allowedMimeTypes: SPREADSHEET_TYPES,
      maxFileSize: 50 * 1024 * 1024,
      fieldName: 'file',
    }),
    ctrl.importFile
  );

  // ============ PUBLIC ROUTES ============

  // Paginated list (public)
  router.get('/', ctrl.getAll);

  // ============ PROTECTED CRUD ============

  // Create article (requires editor role in workspace)
  router.post('/', auth, editorInWorkspace, validateBody(CreateArticleSchema), ctrl.create);

  // Get single article (public)
  router.get('/:id', ctrl.getById);

  // Update article (requires editor role in workspace)
  router.put('/:id', auth, editorInWorkspace, ctrl.update);

  // Delete article (requires editor role in workspace)
  router.delete('/:id', auth, editorInWorkspace, ctrl.delete);

  return router;
}
