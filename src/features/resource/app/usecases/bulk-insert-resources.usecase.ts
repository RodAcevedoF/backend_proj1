import { Resource } from '@/features/resource/domain/Resource';
import { ResourceFactory } from '@/features/resource/domain/ResourceFactory';
import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { BulkInsertResourcesDTO, CreateResourceDTO, ResourceResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class BulkInsertResourcesUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: BulkInsertResourcesDTO): Promise<ResourceResponseDTO[]> {
    const resources: Resource[] = input.resources.map((dto) => this.createResource(dto));

    await this.repository.bulkInsert(resources);

    return resources.map(resourceToResponseDTO);
  }

  private createResource(input: CreateResourceDTO): Resource {
    switch (input.type) {
      case 'article':
        return ResourceFactory.createArticle({
          workspaceId: input.workspaceId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          tags: input.tags,
          categoryIds: input.categoryIds,
          status: input.status,
          source: input.source,
          externalId: input.externalId,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          metadata: input.metadata,
        });
      case 'video':
        return ResourceFactory.createVideo({
          workspaceId: input.workspaceId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          tags: input.tags,
          categoryIds: input.categoryIds,
          status: input.status,
          source: input.source,
          externalId: input.externalId,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          metadata: input.metadata,
        });
      case 'book':
        return ResourceFactory.createBook({
          workspaceId: input.workspaceId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          tags: input.tags,
          categoryIds: input.categoryIds,
          status: input.status,
          source: input.source,
          externalId: input.externalId,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          metadata: input.metadata,
        });
      case 'course':
        return ResourceFactory.createCourse({
          workspaceId: input.workspaceId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          tags: input.tags,
          categoryIds: input.categoryIds,
          status: input.status,
          source: input.source,
          externalId: input.externalId,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          metadata: input.metadata,
        });
      case 'paper':
        return ResourceFactory.createPaper({
          workspaceId: input.workspaceId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          tags: input.tags,
          categoryIds: input.categoryIds,
          status: input.status,
          source: input.source,
          externalId: input.externalId,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          metadata: input.metadata,
        });
      case 'exercise':
        return ResourceFactory.createExercise({
          workspaceId: input.workspaceId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          url: input.url,
          tags: input.tags,
          categoryIds: input.categoryIds,
          status: input.status,
          source: input.source,
          externalId: input.externalId,
          difficulty: input.difficulty,
          estimatedDuration: input.estimatedDuration,
          metadata: input.metadata,
        });
    }
  }
}
