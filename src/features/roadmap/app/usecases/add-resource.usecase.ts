import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/iroadmap.repository';
import { LearningResource } from '../../domain/value-objects/LearningResource';
import { AddResourceDto } from '../dtos/roadmap.dto';

/**
 * Add Resource to Step Use Case
 * Adds a learning resource to a roadmap step
 */
export class AddResourceUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(roadmapId: string, dto: AddResourceDto): Promise<Result<void>> {
    try {
      const roadmap = await this.roadmapRepository.findById(roadmapId);

      if (!roadmap) {
        return Result.fail('Roadmap not found');
      }

      // Find the step
      const step = roadmap.steps.find((s) => s.order === dto.stepOrder);

      if (!step) {
        return Result.fail(`Step with order ${dto.stepOrder} not found`);
      }

      // Create learning resource
      const resource = LearningResource.create({
        title: dto.title,
        type: dto.type,
        url: dto.url,
        description: dto.description,
        estimatedDuration: dto.estimatedDuration,
        difficulty: dto.difficulty,
      });

      // Add resource to step
      const updatedStep = step.addResource(resource);

      // Update roadmap
      roadmap.updateStep(dto.stepOrder, updatedStep);

      // Save
      await this.roadmapRepository.save(roadmap);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to add resource'
      );
    }
  }
}
