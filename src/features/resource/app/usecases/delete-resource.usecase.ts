import { IResourceRepository } from '@/features/resource/domain/ports/outbound/iresource.repository';
import { DeleteResourceDTO } from '../dtos/resource.dto';

export class DeleteResourceUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(input: DeleteResourceDTO): Promise<void> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new Error(`Resource with id ${input.id} not found`);
    }

    await this.repository.deleteById(input.id);
  }
}
