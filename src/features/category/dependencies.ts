import { MongoCategoryRepository } from './infrastructure/adapters/driven/mongo-category.repository';
import { CreateCategoryUseCase } from './app/usecases/create-category.usecase';
import { UpdateCategoryUseCase } from './app/usecases/update-category.usecase';
import { DeleteCategoryUseCase } from './app/usecases/delete-category.usecase';
import { ListCategoriesUseCase } from './app/usecases/list-categories.usecase';
import { CategoryServiceAdapter } from './infrastructure/adapters/driver/category.service-adapter';
import { CategoryController } from './infrastructure/adapters/driver/http/category.controller';
import { ICategoryRepository } from './domain/ports/outbound/icategory.repository';
import { ICategoryService } from './domain/ports/inbound/icategory.service';

export type CategoryDependencies = {
  categoryRepository: ICategoryRepository;
  categoryService: ICategoryService;
  categoryController: CategoryController;
};

export function makeCategoryDependencies(): CategoryDependencies {
  const categoryRepository = new MongoCategoryRepository();

  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
  const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
  const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);
  const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository);

  const categoryService = new CategoryServiceAdapter(
    createCategoryUseCase,
    updateCategoryUseCase,
    deleteCategoryUseCase,
    listCategoriesUseCase
  );

  const categoryController = new CategoryController(categoryService);

  return {
    categoryRepository,
    categoryService,
    categoryController,
  };
}
