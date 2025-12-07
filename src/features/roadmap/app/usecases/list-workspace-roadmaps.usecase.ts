import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/IRoadmapRepository';
import { RoadmapResponseDto } from '../dtos/roadmap.dto';

/**
 * List Workspace Roadmaps Use Case
 * Gets all roadmaps in a workspace
 */
export class ListWorkspaceRoadmapsUseCase {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(
    workspaceId: string,
    onlyPublished: boolean = false
  ): Promise<Result<RoadmapResponseDto[]>> {
    try {
      const roadmaps = onlyPublished
        ? await this.roadmapRepository.findPublishedByWorkspaceId(workspaceId)
        : await this.roadmapRepository.findByWorkspaceId(workspaceId);

      const dtos = roadmaps.map((roadmap) => {
        const primitives = roadmap.toPrimitives();
        return {
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
        };
      });

      return Result.ok(dtos);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to list roadmaps'
      );
    }
  }
}
