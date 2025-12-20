import { ICategoryRepository } from '../../domain/ports/outbound/icategory.repository';
import { CategoryResponseDto } from '../dtos/category.dto';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(workspaceId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findByWorkspaceId(workspaceId);

    return categories.map((c) => {
      const p = c.toPrimitives();
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
    });
  }
}
