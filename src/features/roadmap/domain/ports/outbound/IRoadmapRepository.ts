import { Roadmap } from '../../Roadmap';

/**
 * Roadmap Repository Port (Outbound)
 * Defines contract for roadmap persistence
 */
export interface IRoadmapRepository {
  /**
   * Save roadmap (create or update)
   */
  save(roadmap: Roadmap): Promise<void>;

  /**
   * Find roadmap by ID
   */
  findById(id: string): Promise<Roadmap | null>;

  /**
   * Find all roadmaps in a workspace
   */
  findByWorkspaceId(workspaceId: string): Promise<Roadmap[]>;

  /**
   * Find published roadmaps in a workspace
   */
  findPublishedByWorkspaceId(workspaceId: string): Promise<Roadmap[]>;

  /**
   * Find roadmaps created by a user
   */
  findByCreatorId(userId: string): Promise<Roadmap[]>;

  /**
   * Delete roadmap
   */
  delete(id: string): Promise<void>;

  /**
   * Check if roadmap exists
   */
  exists(id: string): Promise<boolean>;
}
