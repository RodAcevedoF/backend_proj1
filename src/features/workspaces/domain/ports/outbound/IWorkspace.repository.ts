import { Workspace } from '@/features/workspaces/domain/workspace';
import { EntityId } from '@/core/domain/EntityId';

/**
 * Workspace Repository Port (Outbound)
 * Defines the contract for workspace persistence operations
 * Infrastructure adapters must implement this interface
 */
export interface IWorkspaceRepository {
  /**
   * Find workspace by ID
   */
  findById(id: EntityId): Promise<Workspace | null>;

  /**
   * Find all workspaces where user is a member
   */
  findByUserId(userId: EntityId): Promise<Workspace[]>;

  /**
   * Search workspaces by name (for user's workspaces only)
   */
  findByNameAndUserId(name: string, userId: EntityId): Promise<Workspace[]>;

  /**
   * Save workspace (create or update)
   * Should publish domain events after successful save
   */
  save(workspace: Workspace): Promise<void>;

  /**
   * Delete workspace by ID
   */
  delete(id: EntityId): Promise<void>;

  /**
   * Check if user is a member of workspace
   */
  isMember(workspaceId: EntityId, userId: EntityId): Promise<boolean>;
}
