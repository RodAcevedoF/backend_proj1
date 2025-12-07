import { Result } from '../../../../core/domain/Result';
import { IRoadmapRepository } from '../../domain/ports/outbound/iroadmap.repository';
import { IAIRoadmapGenerator } from '../../domain/ports/outbound/ia-iroadmap-generator';
import { IArticleRepository } from '../../../article/domain/ports/outbound/iarticle.repository';
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
    private readonly articleRepository: IArticleRepository
  ) {}

  async execute(
    dto: GenerateAIRoadmapDto,
    userId: string
  ): Promise<Result<RoadmapResponseDto>> {
    try {
      // Fetch articles
      const articles = await Promise.all(
        dto.articleIds.map((id) => this.articleRepository.findById(id))
      );

      // Filter out null results
      const validArticles = articles.filter((a) => a !== null);

      if (validArticles.length === 0) {
        return Result.fail('No valid articles found');
      }

      // Prepare article data for AI
      const articleData = validArticles.map((article) => ({
        id: article!.id.toString(),
        title: article!.title,
        abstract: article!.content, // Using content as abstract
        content: article!.content,
      }));

      // Generate roadmap using AI
      const aiRoadmap = await this.aiGenerator.generateRoadmap({
        articles: articleData,
        targetAudience: dto.targetAudience,
        focusAreas: dto.focusAreas,
        estimatedWeeks: dto.estimatedWeeks,
      });

      // Create roadmap aggregate
      const roadmap = Roadmap.create({
        workspaceId: dto.workspaceId,
        title: aiRoadmap.title,
        description: aiRoadmap.description,
        steps: aiRoadmap.steps,
        progress: [],
        sourceArticleIds: dto.articleIds,
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

  private mapToDto(roadmap: Roadmap): RoadmapResponseDto {
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
  }
}
