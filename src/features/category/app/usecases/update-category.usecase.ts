import { Result } from '@/core/domain';
import { ICategoryRepository } from '../../domain/ports/outbound/icategory.repository';
import { UpdateCategoryDto, CategoryResponseDto } from '../dtos/category.dto';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(dto: UpdateCategoryDto): Promise<Result<CategoryResponseDto>> {
    const category = await this.categoryRepository.findById(dto.id);

    if (!category) {
      return Result.fail('Category not found');
    }

    // Check for duplicate name if name is being changed
    if (dto.name && dto.name !== category.name) {
      const exists = await this.categoryRepository.existsByNameInWorkspace(
        dto.name,
        category.workspaceId
      );
      if (exists) {
        return Result.fail('Category with this name already exists in workspace');
      }
    }

    category.update({
      name: dto.name,
      description: dto.description,
      color: dto.color,
    });

    await this.categoryRepository.save(category);

    const p = category.toPrimitives();
    return Result.ok({
      id: p.id,
      workspaceId: p.workspaceId,
      name: p.name,
      description: p.description,
      color: p.color,
      createdBy: p.createdBy,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    });
  }
}
