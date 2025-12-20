import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { FindResourcesDTO, PaginatedResourcesResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class FindResourcesUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: FindResourcesDTO): Promise<PaginatedResourcesResponseDTO> {
    const result = await this.repository.findWithFilters(
      {
        workspaceId: input.workspaceId,
        userId: input.userId,
        type: input.type,
        types: input.types,
        status: input.status,
        source: input.source,
        categoryIds: input.categoryIds,
        tags: input.tags,
        search: input.search,
      },
      {
        page: input.page ?? 1,
        limit: input.limit ?? 20,
      },
      {
        field: input.sortField ?? 'createdAt',
        order: input.sortOrder ?? 'desc',
      }
    );

    return {
      data: result.data.map(resourceToResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
