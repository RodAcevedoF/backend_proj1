import { EntityId, Email } from '@/core/domain';
import { User } from '@/features/users/domain/User';
import { IUserService } from '@/features/users/domain/ports/inbound/IUserService';
import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';

/**
 * User Service Adapter
 * Implements IUserService for cross-feature consumption
 */
export class UserServiceAdapter implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: EntityId): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async save(user: User): Promise<void> {
    return this.userRepository.save(user);
  }
}
