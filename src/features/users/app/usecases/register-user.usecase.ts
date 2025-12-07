import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/IWorkspaceService';
import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { RegisterUserDto } from '@/features/users/app/dtos/user.dto';
import { IPasswordHasher } from '@/core/infrastructure/ports/IPasswordHasher';
import { User } from '@/features/users/domain/User';
import { Email, Result } from '@/core/domain';

/**
 * Register User Use Case
 * Creates a new user with optional initial workspace
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly workspaceService: IWorkspaceService,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: RegisterUserDto): Promise<Result<User>> {
    // Check if email already exists
    const email = Email.create(dto.email);
    const emailExists = await this.userRepository.existsByEmail(email);

    if (emailExists) {
      return Result.fail('Email already registered');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Create user first (without workspace)
    const user = User.create(email, passwordHash);

    // Update profile if provided
    if (dto.firstName || dto.lastName) {
      user.updateProfile({
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
    }

    // Save user
    await this.userRepository.save(user);

    // Create initial workspace if name provided (via workspace service)
    if (dto.workspaceName) {
      const workspaceResult = await this.workspaceService.createWorkspace(
        dto.workspaceName,
        user.id.toString()
      );

      if (workspaceResult.isFailure) {
        // User created but workspace failed - log but don't fail registration
        console.error(
          'Failed to create initial workspace:',
          workspaceResult.getError()
        );
      }
    }

    return Result.ok(user);
  }
}
