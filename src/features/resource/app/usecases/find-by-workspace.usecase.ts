import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { FindByWorkspaceDTO, ResourceResponseDTO } from '../dtos/resource.dto';
import { resourceToResponseDTO } from './mappers';

export class FindResourcesByWorkspaceUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: FindByWorkspaceDTO): Promise<ResourceResponseDTO[]> {
    const resources = await this.repository.findByWorkspace(input.workspaceId);
    return resources.map(resourceToResponseDTO);
  }
}
