import { Router, RequestHandler } from 'express';
import { RoadmapController } from './roadmap.controller';

export type RoadmapRouteDeps = {
  roadmapController: RoadmapController;
  authMiddleware: { authenticate: () => RequestHandler };
  authzMiddleware: {
    requireWorkspaceEditor: () => RequestHandler;
    requireWorkspaceMember: () => RequestHandler;
  };
};

export function createRoadmapRoutes(deps: RoadmapRouteDeps): Router {
  const router = Router();

  const { roadmapController, authMiddleware, authzMiddleware } = deps;

  router.use(authMiddleware.authenticate());

  // Workspace-scoped routes
  router.post(
    '/workspaces/:workspaceId/roadmaps',
    authzMiddleware.requireWorkspaceEditor(),
    (req, res) => roadmapController.createRoadmap(req, res)
  );

  router.post(
    '/workspaces/:workspaceId/roadmaps/generate',
    authzMiddleware.requireWorkspaceEditor(),
    (req, res) => roadmapController.generateAIRoadmap(req, res)
  );

  router.get(
    '/workspaces/:workspaceId/roadmaps',
    authzMiddleware.requireWorkspaceMember(),
    (req, res) => roadmapController.listWorkspaceRoadmaps(req, res)
  );

  // Roadmap-specific routes
  router.get('/roadmaps/:roadmapId', (req, res) =>
    roadmapController.getRoadmap(req, res)
  );

  router.put('/roadmaps/:roadmapId/progress', (req, res) =>
    roadmapController.updateProgress(req, res)
  );

  router.post('/roadmaps/:roadmapId/resources', (req, res) =>
    roadmapController.addResource(req, res)
  );

  router.put('/roadmaps/:roadmapId/publish', (req, res) =>
    roadmapController.publishRoadmap(req, res)
  );

  return router;
}
