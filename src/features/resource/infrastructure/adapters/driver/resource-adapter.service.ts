import { IResourceService } from '@/features/resource/domain/ports/inbound/iresource.service';
import { CreateResourceUseCase } from '@/features/resource/app/usecases/create-resource.usecase';
import { GetResourceUseCase } from '@/features/resource/app/usecases/get-resource.usecase';
import { GetResourcesByIdsUseCase } from '@/features/resource/app/usecases/get-resources-by-ids.usecase';
import { FindResourcesByWorkspaceUseCase } from '@/features/resource/app/usecases/find-by-workspace.usecase';
import { FindResourcesUseCase } from '@/features/resource/app/usecases/find-resources.usecase';
import { UpdateResourceUseCase } from '@/features/resource/app/usecases/update-resource.usecase';
import { DeleteResourceUseCase } from '@/features/resource/app/usecases/delete-resource.usecase';
import { BulkInsertResourcesUseCase } from '@/features/resource/app/usecases/bulk-insert-resources.usecase';
import {
  CreateResourceDTO,
  GetResourceDTO,
  GetResourcesByIdsDTO,
  FindByWorkspaceDTO,
  FindResourcesDTO,
  UpdateResourceDTO,
  DeleteResourceDTO,
  BulkInsertResourcesDTO,
  ResourceResponseDTO,
  PaginatedResourcesResponseDTO,
} from '@/features/resource/app/dtos/resource.dto';

export class ResourceServiceAdapter implements IResourceService {
  constructor(
    private readonly createResourceUseCase: CreateResourceUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
    private readonly getResourcesByIdsUseCase: GetResourcesByIdsUseCase,
    private readonly findByWorkspaceUseCase: FindResourcesByWorkspaceUseCase,
    private readonly findResourcesUseCase: FindResourcesUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly deleteResourceUseCase: DeleteResourceUseCase,
    private readonly bulkInsertUseCase: BulkInsertResourcesUseCase
  ) {}

  async create(input: CreateResourceDTO): Promise<ResourceResponseDTO> {
    return this.createResourceUseCase.execute(input);
  }

  async getById(input: GetResourceDTO): Promise<ResourceResponseDTO> {
    return this.getResourceUseCase.execute(input);
  }

  async getByIds(input: GetResourcesByIdsDTO): Promise<ResourceResponseDTO[]> {
    return this.getResourcesByIdsUseCase.execute(input);
  }

  async findByWorkspace(input: FindByWorkspaceDTO): Promise<ResourceResponseDTO[]> {
    return this.findByWorkspaceUseCase.execute(input);
  }

  async findResources(input: FindResourcesDTO): Promise<PaginatedResourcesResponseDTO> {
    return this.findResourcesUseCase.execute(input);
  }

  async update(input: UpdateResourceDTO): Promise<ResourceResponseDTO> {
    return this.updateResourceUseCase.execute(input);
  }

  async delete(input: DeleteResourceDTO): Promise<void> {
    return this.deleteResourceUseCase.execute(input);
  }

  async bulkInsert(input: BulkInsertResourcesDTO): Promise<ResourceResponseDTO[]> {
    return this.bulkInsertUseCase.execute(input);
  }
}
