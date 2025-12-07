import { User } from '../../User';
import { EntityId } from '../../../../../core/domain/EntityId';
import { Email } from '../../../../../core/domain/Email';

/**
 * User Repository Port (Outbound)
 * Defines the contract for user persistence operations
 * Infrastructure adapters must implement this interface
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: EntityId): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Find all users that are members of a workspace
   */
  findByWorkspaceId(workspaceId: EntityId): Promise<User[]>;

  /**
   * Save user (create or update)
   * Should publish domain events after successful save
   */
  save(user: User): Promise<void>;

  /**
   * Delete user by ID
   */
  delete(id: EntityId): Promise<void>;

  /**
   * Check if email exists
   */
  existsByEmail(email: Email): Promise<boolean>;
}
