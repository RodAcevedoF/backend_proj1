import {
  LoginUserDto,
  AuthResponseDto,
  UserResponseDto,
} from '@/features/users/app/dtos/user.dto';
import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { IPasswordHasher } from '@/core/infrastructure/ports/IPasswordHasher';
import { ITokenService } from '@/core/infrastructure/ports/ITokenService';
import { Email, Result } from '@/core/domain';
import { User } from '@/features/users/domain/User';

/**
 * Login User Use Case
 * Authenticates user and returns tokens
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(dto: LoginUserDto): Promise<Result<AuthResponseDto>> {
    // Find user by email
    const email = Email.create(dto.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Result.fail('Invalid credentials');
    }

    // Verify password
    const passwordValid = await this.passwordHasher.compare(
      dto.password,
      user.toPrimitives().passwordHash
    );

    if (!passwordValid) {
      return Result.fail('Invalid credentials');
    }

    // Record login
    user.recordLogin();
    await this.userRepository.save(user);

    // Create session
    const sessionId = await this.tokenService.createSession({
      userId: user.id.toString(),
      email: user.email.toString(),
    });

    // Build response
    const userResponse = this.mapToDto(user);

    return Result.ok({
      user: userResponse,
      sessionId, // Will be set as HTTP-only cookie by controller
    });
  }

  private mapToDto(user: User): UserResponseDto {
    const primitives = user.toPrimitives();

    return {
      id: primitives.id,
      email: primitives.email,
      profile: {
        ...primitives.profile,
        displayName:
          primitives.profile.firstName || primitives.profile.lastName
            ? `${primitives.profile.firstName || ''} ${primitives.profile.lastName || ''}`.trim()
            : 'User',
      },
      workspaces: primitives.workspaces.map((ws) => ({
        workspaceId: ws.workspaceId,
        role: ws.role,
        joinedAt: ws.joinedAt,
        isActive: !ws.membershipEnd || new Date(ws.membershipEnd) > new Date(),
      })),
      isEmailVerified: primitives.isEmailVerified,
      lastLoginAt: primitives.lastLoginAt,
      createdAt: primitives.createdAt,
    };
  }
}
