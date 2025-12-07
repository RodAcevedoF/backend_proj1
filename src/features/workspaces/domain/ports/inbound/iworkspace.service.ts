import { Workspace } from '@/features/workspaces/domain/workspace';
import { EntityId, Result } from '@/core/domain';
import {
  CreateWorkspaceDto,
  InviteMemberDto,
} from '@/features/workspaces/app/dtos/workspace.dto';

/**
 * Workspace Service Interface
 * Primary port for workspace operations
 */
export interface IWorkspaceService {
  create(dto: CreateWorkspaceDto, userId: EntityId): Promise<Result<Workspace>>;
  inviteMember(
    workspaceId: EntityId,
    dto: InviteMemberDto,
    invitedById: EntityId
  ): Promise<Result<void>>;

  // For cross-feature use (legacy signature kept for compatibility)
  createWorkspace(
    name: string,
    ownerId: string,
    description?: string
  ): Promise<Result<Workspace>>;
}
