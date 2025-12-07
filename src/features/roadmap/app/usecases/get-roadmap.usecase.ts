import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/iroadmap.repository';
import { RoadmapWithProgressDto } from '../dtos/roadmap.dto';

/**
 * Get Roadmap Use Case
 * Retrieves a roadmap with user's progress
 */
export class GetRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(
    roadmapId: string,
    userId: string
  ): Promise<Result<RoadmapWithProgressDto>> {
    try {
      const roadmap = await this.roadmapRepository.findById(roadmapId);

      if (!roadmap) {
        return Result.fail('Roadmap not found');
      }

      const primitives = roadmap.toPrimitives();
      const userProgress = roadmap.getUserProgress(userId);
      const completedSteps = userProgress
        .filter((p) => p.isCompleted)
        .map((p) => p.stepOrder);

      // Determine current step (first incomplete step)
      const allStepOrders = roadmap.steps
        .map((s) => s.order)
        .sort((a, b) => a - b);
      const currentStep = allStepOrders.find(
        (order) => !completedSteps.includes(order)
      );

      return Result.ok({
        id: primitives.id,
        workspaceId: primitives.workspaceId,
        title: primitives.title,
        description: primitives.description,
        steps: primitives.steps,
        sourceArticleIds: primitives.sourceArticleIds,
        generatedBy: primitives.generatedBy,
        createdBy: primitives.createdBy,
        createdAt: primitives.createdAt,
        updatedAt: primitives.updatedAt,
        isPublished: primitives.isPublished,
        userProgress: {
          completionPercentage: roadmap.getCompletionPercentage(userId),
          completedSteps,
          currentStep,
        },
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to get roadmap'
      );
    }
  }
}
