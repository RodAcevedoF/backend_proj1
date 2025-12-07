import { Router, RequestHandler } from 'express';
import { WorkspaceController } from './workspace.controller';

export type WorkspaceRouteDeps = {
  workspaceController: WorkspaceController;
  authMiddleware: { authenticate: () => RequestHandler };
  authzMiddleware: { requireWorkspaceManager: () => RequestHandler };
};

export function createWorkspaceRoutes(deps: WorkspaceRouteDeps): Router {
  const router = Router();

  const { workspaceController, authMiddleware, authzMiddleware } = deps;

  router.use(authMiddleware.authenticate());

  router.post('/', (req, res) => workspaceController.createWorkspace(req, res));

  router.post(
    '/:workspaceId/members',
    authzMiddleware.requireWorkspaceManager(),
    (req, res) => workspaceController.inviteMember(req, res)
  );

  return router;
}
