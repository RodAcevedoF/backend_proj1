import { IUserRepository } from '@/features/users/domain/ports/outbound/iuser.repository';
import { IOAuthProvider } from '@/core/domain/ports/IOAuthProvider';
import { ITokenService } from '@/core/domain/ports/ITokenService';
import { Email, Result } from '@/core/domain';
import { User } from '@/features/users/domain/User';
import { AuthResponseDto, UserResponseDto } from '../dtos/user.dto';

export class GoogleAuthUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly oauthProvider: IOAuthProvider,
    private readonly tokenService: ITokenService
  ) {}

  async execute(code: string): Promise<Result<AuthResponseDto>> {
    // Exchange code for user info
    const { user: oauthUser } = await this.oauthProvider.handleCallback(code);

    const email = Email.create(oauthUser.email);

    // Check if user exists
    let user = await this.userRepository.findByEmail(email);

    if (user) {
      // Existing user - check if they used a different auth method
      if (user.authProvider === 'email') {
        // Link accounts - update to allow both
        // For now, just log them in (email was verified by Google)
        if (!user.isEmailVerified) {
          user.verifyEmail();
        }
      }
    } else {
      // Create new user from OAuth
      const nameParts = oauthUser.name?.split(' ') || [];
      user = User.createFromOAuth(email, oauthUser.id, 'google', {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || undefined,
        avatarUrl: oauthUser.avatarUrl,
      });
    }

    // Record login
    user.recordLogin();
    await this.userRepository.save(user);

    // Create session
    const sessionId = await this.tokenService.createSession({
      userId: user.id.toString(),
      email: user.email.toString(),
    });

    return Result.ok({
      user: this.mapToDto(user),
      sessionId,
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
