import { CreateResourceUseCase } from './app/usecases/create-resource.usecase';
import { GetResourceUseCase } from './app/usecases/get-resource.usecase';
import { GetResourcesByIdsUseCase } from './app/usecases/get-resources-by-ids.usecase';
import { FindResourcesByWorkspaceUseCase } from './app/usecases/find-by-workspace.usecase';
import { FindResourcesUseCase } from './app/usecases/find-resources.usecase';
import { UpdateResourceUseCase } from './app/usecases/update-resource.usecase';
import { DeleteResourceUseCase } from './app/usecases/delete-resource.usecase';
import { BulkInsertResourcesUseCase } from './app/usecases/bulk-insert-resources.usecase';
import { MongoResourceRepository } from './infrastructure/adapters/driven/persistence/mongo-resource.repository';
import { ResourceServiceAdapter } from './infrastructure/adapters/driver/resource-adapter.service';
import { ResourceController } from './infrastructure/adapters/driver/http/resource.controller';

export type ResourceDependencies = {
  resourceRepository: MongoResourceRepository;
  createUseCase: CreateResourceUseCase;
  getByIdUseCase: GetResourceUseCase;
  getByIdsUseCase: GetResourcesByIdsUseCase;
  findByWorkspaceUseCase: FindResourcesByWorkspaceUseCase;
  findResourcesUseCase: FindResourcesUseCase;
  updateUseCase: UpdateResourceUseCase;
  deleteUseCase: DeleteResourceUseCase;
  bulkInsertUseCase: BulkInsertResourcesUseCase;
  resourceService: ResourceServiceAdapter;
  resourceController: ResourceController;
};

export function makeResourceDependencies(): ResourceDependencies {
  const resourceRepository = new MongoResourceRepository();

  const createUseCase = new CreateResourceUseCase(resourceRepository);
  const getByIdUseCase = new GetResourceUseCase(resourceRepository);
  const getByIdsUseCase = new GetResourcesByIdsUseCase(resourceRepository);
  const findByWorkspaceUseCase = new FindResourcesByWorkspaceUseCase(resourceRepository);
  const findResourcesUseCase = new FindResourcesUseCase(resourceRepository);
  const updateUseCase = new UpdateResourceUseCase(resourceRepository);
  const deleteUseCase = new DeleteResourceUseCase(resourceRepository);
  const bulkInsertUseCase = new BulkInsertResourcesUseCase(resourceRepository);

  const resourceService = new ResourceServiceAdapter(
    createUseCase,
    getByIdUseCase,
    getByIdsUseCase,
    findByWorkspaceUseCase,
    findResourcesUseCase,
    updateUseCase,
    deleteUseCase,
    bulkInsertUseCase
  );

  const resourceController = new ResourceController(resourceService);

  return {
    resourceRepository,
    createUseCase,
    getByIdUseCase,
    getByIdsUseCase,
    findByWorkspaceUseCase,
    findResourcesUseCase,
    updateUseCase,
    deleteUseCase,
    bulkInsertUseCase,
    resourceService,
    resourceController,
  };
}

export const defaultResourceDependencies = makeResourceDependencies();
