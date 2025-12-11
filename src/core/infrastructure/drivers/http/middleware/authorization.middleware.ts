import { Request, Response, NextFunction } from 'express';
import { IWorkspaceRepository } from '@/features/workspaces/domain/ports/outbound/iworkspace.repository';
import { EntityId } from '@/core/domain/EntityId';
import { Role, hasMinimumRole, canEdit, canManage } from '@/core/domain/Role';

/**
 * Authorization Middleware
 * Checks workspace permissions and attaches workspace context to request
 */
export class AuthorizationMiddleware {
  constructor(private readonly workspaceRepository: IWorkspaceRepository) {}

  /**
   * Helper to get workspace and member, attach to req.workspace
   */
  private async getWorkspaceContext(
    req: Request,
    res: Response,
    workspaceIdParam: string
  ): Promise<{ role: Role; workspaceId: string } | null> {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return null;
    }

    const workspaceId = req.params[workspaceIdParam] || req.body?.workspaceId;
    if (!workspaceId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Workspace ID required',
      });
      return null;
    }

    const userId = EntityId.from(req.user.userId);
    const wsId = EntityId.from(workspaceId);

    const workspace = await this.workspaceRepository.findById(wsId);

    if (!workspace) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Workspace not found',
      });
      return null;
    }

    const member = workspace.getMember(userId);

    if (!member) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this workspace',
      });
      return null;
    }

    // Attach workspace context to request
    req.workspace = {
      workspaceId,
      role: member.role,
    };

    return { role: member.role, workspaceId };
  }

  /**
   * Require user to have one of the specified roles in the workspace
   */
  requireRole(roles: Role[], workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = await this.getWorkspaceContext(req, res, workspaceIdParam);
        if (!context) return;

        if (!roles.includes(context.role)) {
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
        });
      }
    };
  }

  /**
   * Require user to have at least the specified minimum role
   * Uses role hierarchy: owner > admin > editor > viewer
   */
  requireMinRole(minRole: Role, workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = await this.getWorkspaceContext(req, res, workspaceIdParam);
        if (!context) return;

        if (!hasMinimumRole(context.role, minRole)) {
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
        });
      }
    };
  }

  /**
   * Require user to be a workspace member (any role)
   */
  requireWorkspaceMember(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = await this.getWorkspaceContext(req, res, workspaceIdParam);
        if (!context) return;

        // If we got here, user is a member
        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
        });
      }
    };
  }

  /**
   * Require user to have edit permissions (editor, admin, or owner)
   */
  requireWorkspaceEditor(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = await this.getWorkspaceContext(req, res, workspaceIdParam);
        if (!context) return;

        if (!canEdit(context.role)) {
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
        });
      }
    };
  }

  /**
   * Require user to have management permissions (admin or owner)
   */
  requireWorkspaceManager(workspaceIdParam: string = 'workspaceId') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const context = await this.getWorkspaceContext(req, res, workspaceIdParam);
        if (!context) return;

        if (!canManage(context.role)) {
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
        const context = await this.getWorkspaceContext(req, res, workspaceIdParam);
        if (!context) return;

        if (context.role !== 'owner') {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions - owner role required',
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Authorization check failed',
        });
      }
    };
  }
}
