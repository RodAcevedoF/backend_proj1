import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { GetResourcesByIdsDTO, ResourceResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class GetResourcesByIdsUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: GetResourcesByIdsDTO): Promise<ResourceResponseDTO[]> {
    const resources = await this.repository.findByIds(input.ids);
    return resources.map(resourceToResponseDTO);
  }
}
