import { randomBytes } from 'crypto';
import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { IEmailService } from '@/core/domain/ports/IEmailService';
import { Email, Result } from '@/core/domain';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly frontendUrl: string
  ) {}

  async execute(email: Email): Promise<Result<void>> {
    const user = await this.userRepository.findByEmail(email);

    // Don't reveal if email exists - always return success
    if (!user) {
      return Result.ok(undefined);
    }

    // OAuth users can't reset password
    if (user.isOAuthUser()) {
      return Result.ok(undefined);
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Set token on user (1h expiry)
    user.setPasswordResetToken(token, 1);
    await this.userRepository.save(user);

    // Send reset email
    const redirectUrl = `${this.frontendUrl}/auth/reset-password`;
    await this.emailService.sendPasswordResetEmail(
      email.toString(),
      token,
      redirectUrl
    );

    return Result.ok(undefined);
  }
}
