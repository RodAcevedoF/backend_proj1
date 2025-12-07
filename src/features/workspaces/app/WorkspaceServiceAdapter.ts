import { Result, EntityId } from '@/core/domain';
import { Workspace } from '@/features/workspaces/domain/Workspace';
import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/IWorkspaceService';
import { CreateWorkspaceUseCase } from '@/features/workspaces/app/usecases/create-workspace.usecase';

/**
 * Workspace Service Adapter
 * Implements IWorkspaceService for cross-feature consumption
 */
export class WorkspaceServiceAdapter implements IWorkspaceService {
  constructor(
    private readonly createWorkspaceUseCase: CreateWorkspaceUseCase
  ) {}

  async createWorkspace(
    name: string,
    ownerId: string,
    description?: string
  ): Promise<Result<Workspace>> {
    return this.createWorkspaceUseCase.execute(
      { name, description },
      EntityId.from(ownerId)
    );
  }
}
