import { randomBytes } from 'crypto';
import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { IEmailService } from '@/core/domain/ports/IEmailService';
import { Email, Result } from '@/core/domain';

export class SendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly frontendUrl: string
  ) {}

  async execute(email: Email): Promise<Result<void>> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return Result.ok(undefined);
    }

    if (user.isEmailVerified) {
      return Result.fail('Email is already verified');
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Set token on user (24h expiry)
    user.setEmailVerificationToken(token, 24);
    await this.userRepository.save(user);

    // Send verification email
    const redirectUrl = `${this.frontendUrl}/auth/verified`;
    await this.emailService.sendVerificationEmail(
      email.toString(),
      token,
      redirectUrl
    );

    return Result.ok(undefined);
  }
}
