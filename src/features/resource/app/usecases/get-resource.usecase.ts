import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { GetResourceDTO, ResourceResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class GetResourceUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: GetResourceDTO): Promise<ResourceResponseDTO> {
    const resource = await this.repository.findById(input.id);

    if (!resource) {
      throw new Error(`Resource with id ${input.id} not found`);
    }

    return resourceToResponseDTO(resource);
  }
}
