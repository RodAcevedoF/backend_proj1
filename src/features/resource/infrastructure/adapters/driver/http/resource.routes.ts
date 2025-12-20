import { Router, RequestHandler } from 'express';
import { ResourceController } from './resource.controller';
import { validate } from '@/core/infrastructure/drivers/http/validate.middleware';
import {
  CreateResourceSchema,
  UpdateResourceSchema,
  QueryResourcesSchema,
  BulkInsertResourcesSchema,
} from './validators/resource.validators';

export type ResourceRouteDeps = {
  resourceController: ResourceController;
  authMiddleware: { authenticate: () => RequestHandler };
  authzMiddleware: {
    requireWorkspaceEditor: () => RequestHandler;
    requireWorkspaceMember: () => RequestHandler;
  };
};

export function createResourceRoutes(deps: ResourceRouteDeps): Router {
  const router = Router();

  const { resourceController, authMiddleware, authzMiddleware } = deps;

  router.use(authMiddleware.authenticate());

  // Global resource query (with filters)
  router.get('/resources', validate(QueryResourcesSchema, 'query'), (req, res) =>
    resourceController.findResources(req, res)
  );

  // Single resource operations
  router.get('/resources/:resourceId', (req, res) =>
    resourceController.getById(req, res)
  );

  router.put(
    '/resources/:resourceId',
    validate(UpdateResourceSchema),
    (req, res) => resourceController.update(req, res)
  );

  router.delete('/resources/:resourceId', (req, res) =>
    resourceController.delete(req, res)
  );

  // Workspace-scoped routes
  router.post(
    '/workspaces/:workspaceId/resources',
    authzMiddleware.requireWorkspaceEditor(),
    validate(CreateResourceSchema),
    (req, res) => resourceController.create(req, res)
  );

  router.get(
    '/workspaces/:workspaceId/resources',
    authzMiddleware.requireWorkspaceMember(),
    (req, res) => resourceController.findByWorkspace(req, res)
  );

  router.post(
    '/workspaces/:workspaceId/resources/bulk',
    authzMiddleware.requireWorkspaceEditor(),
    validate(BulkInsertResourcesSchema),
    (req, res) => resourceController.bulkInsert(req, res)
  );

  return router;
}
