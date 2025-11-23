import { Workspace } from '@/features/workspaces/Workspace';

export interface WorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
}
