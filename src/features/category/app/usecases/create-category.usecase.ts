import { Result } from '@/core/domain';
import { ICategoryRepository } from '../../domain/ports/outbound/icategory.repository';
import { Category } from '../../domain/Category';
import { CreateCategoryDto, CategoryResponseDto } from '../dtos/category.dto';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDto): Promise<Result<CategoryResponseDto>> {
    // Check for duplicate name in workspace
    const exists = await this.categoryRepository.existsByNameInWorkspace(
      dto.name,
      dto.workspaceId
    );

    if (exists) {
      return Result.fail('Category with this name already exists in workspace');
    }

    const category = Category.create(dto.workspaceId, dto.name, dto.userId, {
      description: dto.description,
      color: dto.color,
    });

    await this.categoryRepository.save(category);

    return Result.ok(this.toResponse(category));
  }

  private toResponse(category: Category): CategoryResponseDto {
    const p = category.toPrimitives();
    return {
      id: p.id,
      workspaceId: p.workspaceId,
      name: p.name,
      description: p.description,
      color: p.color,
      createdBy: p.createdBy,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }
}
