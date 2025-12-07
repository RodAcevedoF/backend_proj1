import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { IPasswordHasher } from '@/core/domain/ports/IPasswordHasher';
import { Result } from '@/core/domain';
import { ResetPasswordDTO } from '../dtos/auth.dto';

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(dto: ResetPasswordDTO): Promise<Result<void>> {
    const user = await this.userRepository.findByPasswordResetToken(dto.token);

    if (!user) {
      return Result.fail('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await this.passwordHasher.hash(dto.newPassword);

    // Reset password with token validation
    const reset = user.resetPasswordWithToken(dto.token, passwordHash);

    if (!reset) {
      return Result.fail('Invalid or expired reset token');
    }

    await this.userRepository.save(user);

    return Result.ok(undefined);
  }
}
