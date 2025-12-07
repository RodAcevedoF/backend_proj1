import { EntityId, Email } from '@/core/domain';
import { User } from '@/features/users/domain/User';

/**
 * User Service Interface
 * Exposed to other features that need user operations
 */
export interface IUserService {
  findById(id: EntityId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
