import { Router, RequestHandler } from 'express';
import { CategoryController } from './category.controller';

export type CategoryRouteDeps = {
  ctrl: CategoryController;
  authMiddleware: { authenticate: () => RequestHandler };
  authzMiddleware: {
    requireWorkspaceMember: (param?: string) => RequestHandler;
    requireWorkspaceEditor: (param?: string) => RequestHandler;
  };
};

export function createCategoryRoutes(deps: CategoryRouteDeps): Router {
  const router = Router({ mergeParams: true }); // mergeParams to access :workspaceId
  const { ctrl, authMiddleware, authzMiddleware } = deps;
  const auth = authMiddleware.authenticate();

  // All routes require authentication and workspace membership
  // GET /workspaces/:workspaceId/categories - List categories (member)
  router.get('/', auth, authzMiddleware.requireWorkspaceMember(), ctrl.list);

  // POST /workspaces/:workspaceId/categories - Create category (editor+)
  router.post('/', auth, authzMiddleware.requireWorkspaceEditor(), ctrl.create);

  // PUT /workspaces/:workspaceId/categories/:categoryId - Update category (editor+)
  router.put(
    '/:categoryId',
    auth,
    authzMiddleware.requireWorkspaceEditor(),
    ctrl.update
  );

  // DELETE /workspaces/:workspaceId/categories/:categoryId - Delete category (editor+)
  router.delete(
    '/:categoryId',
    auth,
    authzMiddleware.requireWorkspaceEditor(),
    ctrl.delete
  );

  return router;
}
