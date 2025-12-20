import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from '../../../app/dtos/category.dto';
import { Result } from '@/core/domain/Result';

export interface ICategoryService {
  create(input: CreateCategoryDto): Promise<Result<CategoryResponseDto>>;
  update(input: UpdateCategoryDto): Promise<Result<CategoryResponseDto>>;
  delete(id: string): Promise<Result<void>>;
  listByWorkspace(workspaceId: string): Promise<CategoryResponseDto[]>;
}
