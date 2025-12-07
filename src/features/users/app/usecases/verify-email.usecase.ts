import { IUserRepository } from '@/features/users/domain/ports/outbound/IUser.repository';
import { Result } from '@/core/domain';
import { VerifyEmailDTO } from '../dtos/auth.dto';

export class VerifyEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: VerifyEmailDTO): Promise<Result<void>> {
    const user = await this.userRepository.findByVerificationToken(dto.token);

    if (!user) {
      return Result.fail('Invalid or expired verification token');
    }

    const verified = user.verifyEmailWithToken(dto.token);

    if (!verified) {
      return Result.fail('Invalid or expired verification token');
    }

    await this.userRepository.save(user);

    return Result.ok(undefined);
  }
}
