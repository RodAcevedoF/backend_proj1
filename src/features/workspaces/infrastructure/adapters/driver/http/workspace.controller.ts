import { Request, Response } from 'express';
import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/iworkspace.service';
import { EntityId } from '@/core/domain/EntityId';
import {
  CreateWorkspaceDto,
  InviteMemberDto,
} from '@/features/workspaces/app/dtos/workspace.dto';

/**
 * Workspace Controller
 * Handles HTTP requests for workspace operations
 */
export class WorkspaceController {
  constructor(private readonly workspaceService: IWorkspaceService) {}

  async createWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const dto: CreateWorkspaceDto = req.body;

      if (!dto.name) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Workspace name is required',
        });
      }

      const userId = EntityId.from(req.user.userId);
      const result = await this.workspaceService.create(dto, userId);

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      const workspace = result.getValue();

      return res.status(201).json({
        message: 'Workspace created successfully',
        data: {
          id: workspace.id.toString(),
          name: workspace.name,
          description: workspace.description,
        },
      });
    } catch (error) {
      console.error('Create workspace error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create workspace',
      });
    }
  }

  async inviteMember(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const { workspaceId } = req.params;
      const dto: InviteMemberDto = req.body;

      if (!dto.email || !dto.role) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email and role are required',
        });
      }

      const wsId = EntityId.from(workspaceId);
      const invitedById = EntityId.from(req.user.userId);

      const result = await this.workspaceService.inviteMember(
        wsId,
        dto,
        invitedById
      );

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Member invited successfully',
      });
    } catch (error) {
      console.error('Invite member error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to invite member',
      });
    }
  }
}
