import { EntityId, Email, Result } from '@/core/domain';
import { User } from '@/features/users/domain/User';
import { IUserService } from '@/features/users/domain/ports/inbound/iuser.service';
import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { RegisterUserUseCase } from '@/features/users/app/usecases/register-user.usecase';
import { LoginUserUseCase } from '@/features/users/app/usecases/login-user.usecase';
import {
  RegisterUserDto,
  LoginUserDto,
  AuthResponseDto,
} from '@/features/users/app/dtos/user.dto';

/**
 * User Service Adapter
 * Implements IUserService - orchestrates use cases
 */
export class UserServiceAdapter implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  async register(dto: RegisterUserDto): Promise<Result<User>> {
    return this.registerUserUseCase.execute(dto);
  }

  async login(dto: LoginUserDto): Promise<Result<AuthResponseDto>> {
    return this.loginUserUseCase.execute(dto);
  }

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
