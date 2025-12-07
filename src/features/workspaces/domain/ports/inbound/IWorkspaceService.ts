import { Workspace } from '@/features/workspaces/domain/Workspace';
import { Result } from '@/core/domain';

/**
 * Workspace Service Interface
 * Exposed to other features that need workspace operations
 */
export interface IWorkspaceService {
  createWorkspace(
    name: string,
    ownerId: string,
    description?: string
  ): Promise<Result<Workspace>>;
}
