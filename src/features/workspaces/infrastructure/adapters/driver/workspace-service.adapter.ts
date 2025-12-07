import { Result, EntityId } from '@/core/domain';
import { Workspace } from '@/features/workspaces/domain/workspace';
import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/iworkspace.service';
import { CreateWorkspaceUseCase } from '@/features/workspaces/app/usecases/create-workspace.usecase';
import { InviteMemberUseCase } from '@/features/workspaces/app/usecases/invite-member.usecase';
import {
  CreateWorkspaceDto,
  InviteMemberDto,
} from '@/features/workspaces/app/dtos/workspace.dto';

/**
 * Workspace Service Adapter
 * Implements IWorkspaceService - orchestrates use cases
 */
export class WorkspaceServiceAdapter implements IWorkspaceService {
  constructor(
    private readonly createWorkspaceUseCase: CreateWorkspaceUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase
  ) {}

  async create(
    dto: CreateWorkspaceDto,
    userId: EntityId
  ): Promise<Result<Workspace>> {
    return this.createWorkspaceUseCase.execute(dto, userId);
  }

  async inviteMember(
    workspaceId: EntityId,
    dto: InviteMemberDto,
    invitedById: EntityId
  ): Promise<Result<void>> {
    return this.inviteMemberUseCase.execute(workspaceId, dto, invitedById);
  }

  // Legacy method for cross-feature compatibility
  async createWorkspace(
    name: string,
    ownerId: string,
    description?: string
  ): Promise<Result<Workspace>> {
    return this.create({ name, description }, EntityId.from(ownerId));
  }
}
