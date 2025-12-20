import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/iroadmap.repository';
import { Roadmap } from '../../domain/Roadmap';
import { CreateRoadmapDto, RoadmapResponseDto } from '../dtos/roadmap.dto';

/**
 * Create Roadmap Use Case
 * Creates a new manual roadmap in a workspace
 */
export class CreateRoadmapUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(
    dto: CreateRoadmapDto,
    userId: string
  ): Promise<Result<RoadmapResponseDto>> {
    try {
      // Create roadmap aggregate
      const roadmap = Roadmap.create({
        workspaceId: dto.workspaceId,
        title: dto.title,
        description: dto.description,
        categoryIds: dto.categoryIds || [],
        steps: [],
        progress: [],
        sourceResourceIds: dto.sourceResourceIds || [],
        generatedBy: 'manual',
        createdBy: userId,
        isPublished: false,
      });

      // Save to repository
      await this.roadmapRepository.save(roadmap);

      // Return response
      return Result.ok(this.mapToDto(roadmap));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to create roadmap'
      );
    }
  }

  private mapToDto(roadmap: Roadmap): RoadmapResponseDto {
    const primitives = roadmap.toPrimitives();
    return {
      id: primitives.id,
      workspaceId: primitives.workspaceId,
      title: primitives.title,
      description: primitives.description,
      categoryIds: primitives.categoryIds,
      steps: primitives.steps,
      sourceResourceIds: primitives.sourceResourceIds,
      generatedBy: primitives.generatedBy,
      createdBy: primitives.createdBy,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
      isPublished: primitives.isPublished,
    };
  }
}
