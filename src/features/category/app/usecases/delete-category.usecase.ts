import { Result } from '@/core/domain';
import { ICategoryRepository } from '../../domain/ports/outbound/icategory.repository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<Result<void>> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      return Result.fail('Category not found');
    }

    await this.categoryRepository.delete(id);

    return Result.ok(undefined);
  }
}
