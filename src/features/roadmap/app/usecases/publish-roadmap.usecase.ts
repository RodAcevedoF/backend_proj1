import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/IRoadmapRepository';

/**
 * Publish Roadmap Use Case
 * Makes a roadmap visible to all workspace members
 */
export class PublishRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(roadmapId: string): Promise<Result<void>> {
    try {
      const roadmap = await this.roadmapRepository.findById(roadmapId);

      if (!roadmap) {
        return Result.fail('Roadmap not found');
      }

      roadmap.publish();
      await this.roadmapRepository.save(roadmap);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to publish roadmap'
      );
    }
  }
}
