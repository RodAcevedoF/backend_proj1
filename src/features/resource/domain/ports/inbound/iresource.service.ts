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

export interface IResourceService {
  create(input: CreateResourceDTO): Promise<ResourceResponseDTO>;

  getById(input: GetResourceDTO): Promise<ResourceResponseDTO>;

  getByIds(input: GetResourcesByIdsDTO): Promise<ResourceResponseDTO[]>;

  findByWorkspace(input: FindByWorkspaceDTO): Promise<ResourceResponseDTO[]>;

  findResources(input: FindResourcesDTO): Promise<PaginatedResourcesResponseDTO>;

  update(input: UpdateResourceDTO): Promise<ResourceResponseDTO>;

  delete(input: DeleteResourceDTO): Promise<void>;

  bulkInsert(input: BulkInsertResourcesDTO): Promise<ResourceResponseDTO[]>;
}
