import { Resource } from '@/features/resource/domain/Resource';
import { ResourceFactory } from '@/features/resource/domain/ResourceFactory';
import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { CreateResourceDTO, ResourceResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class CreateResourceUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: CreateResourceDTO): Promise<ResourceResponseDTO> {
    let resource: Resource;

    switch (input.type) {
      case 'article':
        resource = ResourceFactory.createArticle({
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
        break;
      case 'video':
        resource = ResourceFactory.createVideo({
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
        break;
      case 'book':
        resource = ResourceFactory.createBook({
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
        break;
      case 'course':
        resource = ResourceFactory.createCourse({
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
        break;
      case 'paper':
        resource = ResourceFactory.createPaper({
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
        break;
      case 'exercise':
        resource = ResourceFactory.createExercise({
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
        break;
    }

    await this.repository.save(resource);
    return resourceToResponseDTO(resource);
  }
}
