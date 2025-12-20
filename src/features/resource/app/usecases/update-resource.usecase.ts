import { Resource } from '@/features/resource/domain/Resource';
import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { UpdateResourceDTO, ResourceResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class UpdateResourceUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: UpdateResourceDTO): Promise<ResourceResponseDTO> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new Error(`Resource with id ${input.id} not found`);
    }

    const currentProps = existing.toPrimitives();

    const updatedProps = {
      ...currentProps,
      title: input.title ?? currentProps.title,
      description: input.description ?? currentProps.description,
      url: input.url ?? currentProps.url,
      tags: input.tags ?? currentProps.tags,
      categoryIds: input.categoryIds ?? currentProps.categoryIds,
      status: input.status ?? currentProps.status,
      difficulty: input.difficulty ?? currentProps.difficulty,
      estimatedDuration: input.estimatedDuration ?? currentProps.estimatedDuration,
      metadata: input.metadata
        ? { ...currentProps.metadata, ...input.metadata }
        : currentProps.metadata,
      updatedAt: new Date(),
    };

    const updated = Resource.create(updatedProps as never);
    await this.repository.update(updated);

    return resourceToResponseDTO(updated);
  }
}
