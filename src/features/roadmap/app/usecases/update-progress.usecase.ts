import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/IRoadmapRepository';
import { UpdateProgressDto } from '../dtos/roadmap.dto';

/**
 * Update Progress Use Case
 * Updates user's progress on a roadmap step
 */
export class UpdateProgressUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(
    roadmapId: string,
    dto: UpdateProgressDto,
    userId: string
  ): Promise<Result<void>> {
    try {
      const roadmap = await this.roadmapRepository.findById(roadmapId);

      if (!roadmap) {
        return Result.fail('Roadmap not found');
      }

      // Mark resource as complete
      if (dto.resourceTitle) {
        roadmap.markResourceComplete(userId, dto.stepOrder, dto.resourceTitle);
      }

      // Mark step as complete
      if (dto.completeStep) {
        roadmap.markStepComplete(userId, dto.stepOrder);
      }

      // Add notes
      if (dto.notes) {
        roadmap.addProgressNotes(userId, dto.stepOrder, dto.notes);
      }

      // Save updated roadmap
      await this.roadmapRepository.save(roadmap);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to update progress'
      );
    }
  }
}
