import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/iroadmap.repository';
import { IAIRoadmapGenerator } from '../../domain/ports/outbound/ia-iroadmap-generator';
import { IResourceService } from '../../../resource/domain/ports/inbound/iresource.service';
import { ResourceResponseDTO } from '../../../resource/app/dtos/resource.dto';
import { Roadmap } from '../../domain/Roadmap';
import { GenerateAIRoadmapDto, RoadmapResponseDto } from '../dtos/roadmap.dto';

/**
 * Generate AI Roadmap Use Case
 * Uses AI to analyze articles and generate a learning roadmap
 */
export class GenerateAIRoadmapUseCase {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly aiGenerator: IAIRoadmapGenerator,
    private readonly resourceService: IResourceService
  ) {}

  async execute(
    dto: GenerateAIRoadmapDto,
    userId: string
  ): Promise<Result<RoadmapResponseDto>> {
    try {
      // Fetch resources
      const resources = await this.resourceService.getByIds({ ids: dto.resourceIds });

      if (resources.length === 0) {
        return Result.fail('No valid resources found');
      }

      // Prepare resource data for AI
      const resourceData = resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        abstract: resource.description || '',
        content: this.getResourceContent(resource),
      }));

      // Generate roadmap using AI
      const aiRoadmap = await this.aiGenerator.generateRoadmap({
        articles: resourceData,
        targetAudience: dto.targetAudience,
        focusAreas: dto.focusAreas,
        estimatedWeeks: dto.estimatedWeeks,
      });

      // Create roadmap aggregate
      const roadmap = Roadmap.create({
        workspaceId: dto.workspaceId,
        title: aiRoadmap.title,
        description: aiRoadmap.description,
        categoryIds: dto.categoryIds || [],
        steps: aiRoadmap.steps,
        progress: [],
        sourceResourceIds: dto.resourceIds,
        generatedBy: 'ai',
        createdBy: userId,
        isPublished: false,
      });

      // Save to repository
      await this.roadmapRepository.save(roadmap);

      // Return response
      return Result.ok(this.mapToDto(roadmap));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to generate AI roadmap'
      );
    }
  }

  private getResourceContent(resource: ResourceResponseDTO): string {
    if (resource.type === 'article' || resource.type === 'paper') {
      const metadata = resource.metadata as { content?: string; abstract?: string };
      return metadata.content || metadata.abstract || resource.description || '';
    }
    return resource.description || '';
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
