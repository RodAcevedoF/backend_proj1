import {
  Resource,
  ResourceType,
  ResourceStatus,
  ResourceSource,
} from '@/features/resource/domain/Resource';

export interface ResourceQueryFilters {
  workspaceId?: string;
  userId?: string;
  type?: ResourceType;
  types?: ResourceType[]; // Filter by multiple types
  status?: ResourceStatus;
  source?: ResourceSource;
  categoryIds?: string[];
  tags?: string[];
  search?: string; // Search in title/description
}

export interface PaginationOptions {
  page: number; // 1-based
  limit: number;
}

export interface SortOptions {
  field: 'createdAt' | 'updatedAt' | 'title';
  order: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IResourceRepository {
  findById(id: string): Promise<Resource | null>;

  findByIds(ids: string[]): Promise<Resource[]>;

  findByWorkspace(workspaceId: string): Promise<Resource[]>;

  findByType(workspaceId: string, type: ResourceType): Promise<Resource[]>;

  findWithFilters(
    filters: ResourceQueryFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<PaginatedResult<Resource>>;

  findByExternalId(source: ResourceSource, externalId: string): Promise<Resource | null>;

  save(resource: Resource): Promise<void>;

  bulkInsert(resources: Resource[]): Promise<void>;

  update(resource: Resource): Promise<void>;

  deleteById(id: string): Promise<void>;

  deleteByWorkspace(workspaceId: string): Promise<number>;

  countByWorkspace(workspaceId: string): Promise<number>;

  countByType(workspaceId: string, type: ResourceType): Promise<number>;
}
