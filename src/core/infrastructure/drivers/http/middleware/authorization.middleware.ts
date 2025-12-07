import { Request, Response, NextFunction } from 'express';
import { IWorkspaceRepository } from '@/features/workspaces/domain/ports/outbound/iworkspace.repository';
import { EntityId } from '@/core/domain/EntityId';
import { Role, hasMinimumRole } from '@/core/domain/Role';

/**
 * Authorization Middleware
 * Checks workspace permissions
 */
export class AuthorizationMiddleware {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  /**
   * Require user to have one of the specified roles in the workspace
   * @param roles - Allowed roles (e.g., 'admin', 'editor')
   * @param workspaceIdParam - Request param name for workspace ID
   */
  requireRole(roles: Role[], workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const workspaceId = req.params[workspaceIdParam];
        if (!workspaceId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Workspace ID required',
          });
        }

        const userId = EntityId.from(req.user.userId);
        const wsId = EntityId.from(workspaceId);

        const workspace = await this.workspaceRepository.findById(wsId);

        if (!workspace) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Workspace not found',
          });
        }

        const member = workspace.getMember(userId);

        if (!member) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'You are not a member of this workspace',
          });
        }

        if (!roles.includes(member.role)) {
          return res.status(403).json({
            error: 'Forbidden',
            message: `Insufficient permissions - requires one of: ${roles.join(', ')}`,
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          trace: error instanceof Error ? error.message : String(error),
        });
      }
    };
  }

  /**
   * Require user to have at least the specified minimum role
   * Uses role hierarchy: owner > admin > editor > viewer
   * @param minRole - Minimum required role
   * @param workspaceIdParam - Request param name for workspace ID
   */
  requireMinRole(minRole: Role, workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const workspaceId = req.params[workspaceIdParam];
        if (!workspaceId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Workspace ID required',
          });
        }

        const userId = EntityId.from(req.user.userId);
        const wsId = EntityId.from(workspaceId);

        const workspace = await this.workspaceRepository.findById(wsId);

        if (!workspace) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Workspace not found',
          });
        }

        const member = workspace.getMember(userId);

        if (!member) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'You are not a member of this workspace',
          });
        }

        if (!hasMinimumRole(member.role, minRole)) {
          return res.status(403).json({
            error: 'Forbidden',
            message: `Insufficient permissions - requires at least ${minRole} role`,
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          trace: error instanceof Error ? error.message : String(error),
        });
      }
    };
  }

  /**
   * Require user to be a workspace member
   */
  requireWorkspaceMember(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const workspaceId = req.params[workspaceIdParam];
        if (!workspaceId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Workspace ID required',
          });
        }

        const userId = EntityId.from(req.user.userId);
        const wsId = EntityId.from(workspaceId);

        const isMember = await this.workspaceRepository.isMember(wsId, userId);

        if (!isMember) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'You are not a member of this workspace',
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          trace: error instanceof Error ? error.message : String(error),
        });
      }
    };
  }

  /**
   * Require user to have edit permissions
   */
  requireWorkspaceEditor(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const workspaceId = req.params[workspaceIdParam];
        if (!workspaceId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Workspace ID required',
          });
        }

        const userId = EntityId.from(req.user.userId);
        const wsId = EntityId.from(workspaceId);

        const workspace = await this.workspaceRepository.findById(wsId);

        if (!workspace) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Workspace not found',
          });
        }

        if (!workspace.canEdit(userId)) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions - editor role required',
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          trace: error instanceof Error ? error.message : String(error),
        });
      }
    };
  }

  /**
   * Require user to have management permissions
   */
  requireWorkspaceManager(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const workspaceId = req.params[workspaceIdParam];
        if (!workspaceId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Workspace ID required',
          });
        }

        const userId = EntityId.from(req.user.userId);
        const wsId = EntityId.from(workspaceId);

        const workspace = await this.workspaceRepository.findById(wsId);

        if (!workspace) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Workspace not found',
          });
        }

        if (!workspace.canManage(userId)) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions - admin role required',
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          trace: error instanceof Error ? error.message : String(error),
        });
      }
    };
  }

  /**
   * Require user to be workspace owner
   */
  requireWorkspaceOwner(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const workspaceId = req.params[workspaceIdParam];
        if (!workspaceId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Workspace ID required',
          });
        }

        const userId = EntityId.from(req.user.userId);
        const wsId = EntityId.from(workspaceId);

        const workspace = await this.workspaceRepository.findById(wsId);

        if (!workspace) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'Workspace not found',
          });
        }

        if (!workspace.isOwner(userId)) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions - owner role required',
          });
        }

        next();
      } catch (error: unknown) {
        const trace = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
          trace,
        });
      }
    };
  }
}
