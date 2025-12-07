import { EntityId, Email, Result } from '@/core/domain';
import { User } from '@/features/users/domain/User';
import {
  RegisterUserDto,
  LoginUserDto,
  AuthResponseDto,
} from '@/features/users/app/dtos/user.dto';

/**
 * User Service Interface
 * Primary port for user operations
 */
export interface IUserService {
  // Auth operations
  register(dto: RegisterUserDto): Promise<Result<User>>;
  login(dto: LoginUserDto): Promise<Result<AuthResponseDto>>;

  // Query operations (for cross-feature use)
  findById(id: EntityId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
