import { ICategoryService } from '@/features/category/domain/ports/inbound/icategory.service';
import { CreateCategoryUseCase } from '@/features/category/app/usecases/create-category.usecase';
import { UpdateCategoryUseCase } from '@/features/category/app/usecases/update-category.usecase';
import { DeleteCategoryUseCase } from '@/features/category/app/usecases/delete-category.usecase';
import { ListCategoriesUseCase } from '@/features/category/app/usecases/list-categories.usecase';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from '@/features/category/app/dtos/category.dto';
import { Result } from '@/core/domain/Result';

export class CategoryServiceAdapter implements ICategoryService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase
  ) {}

  async create(input: CreateCategoryDto): Promise<Result<CategoryResponseDto>> {
    return this.createCategoryUseCase.execute(input);
  }

  async update(input: UpdateCategoryDto): Promise<Result<CategoryResponseDto>> {
    return this.updateCategoryUseCase.execute(input);
  }

  async delete(id: string): Promise<Result<void>> {
    return this.deleteCategoryUseCase.execute(id);
  }

  async listByWorkspace(workspaceId: string): Promise<CategoryResponseDto[]> {
    return this.listCategoriesUseCase.execute(workspaceId);
  }
}
