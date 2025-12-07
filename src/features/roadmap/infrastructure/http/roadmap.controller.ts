import { Request, Response } from 'express';
import { CreateRoadmapUseCase } from '../../app/usecases/create-roadmap.usecase';
import { GenerateAIRoadmapUseCase } from '../../app/usecases/generate-ai-roadmap.usecase';
import { GetRoadmapUseCase } from '../../app/usecases/get-roadmap.usecase';
import { UpdateProgressUseCase } from '../../app/usecases/update-progress.usecase';
import { AddResourceUseCase } from '../../app/usecases/add-resource.usecase';
import { ListWorkspaceRoadmapsUseCase } from '../../app/usecases/list-workspace-roadmaps.usecase';
import { PublishRoadmapUseCase } from '../../app/usecases/publish-roadmap.usecase';

/**
 * Roadmap HTTP Controller
 * Handles roadmap-related HTTP requests
 */
export class RoadmapController {
  constructor(
    private readonly createRoadmapUseCase: CreateRoadmapUseCase,
    private readonly generateAIRoadmapUseCase: GenerateAIRoadmapUseCase,
    private readonly getRoadmapUseCase: GetRoadmapUseCase,
    private readonly updateProgressUseCase: UpdateProgressUseCase,
    private readonly addResourceUseCase: AddResourceUseCase,
    private readonly listWorkspaceRoadmapsUseCase: ListWorkspaceRoadmapsUseCase,
    private readonly publishRoadmapUseCase: PublishRoadmapUseCase
  ) {}

  /**
   * POST /workspaces/:workspaceId/roadmaps
   * Create a new manual roadmap
   */
  async createRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const { title, description, sourceArticleIds } = req.body;
      const userId = req.user!.userId;

      const result = await this.createRoadmapUseCase.execute(
        {
          workspaceId,
          title,
          description,
          sourceArticleIds,
        },
        userId
      );

      if (!result.isSuccess) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(201).json({
        message: 'Roadmap created successfully',
        data: result.getValue(),
      });
    } catch (error) {
      console.error('Create roadmap error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create roadmap',
      });
    }
  }

  /**
   * POST /workspaces/:workspaceId/roadmaps/generate
   * Generate AI-powered roadmap from articles
   */
  async generateAIRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const { articleIds, targetAudience, focusAreas, estimatedWeeks } = req.body;
      const userId = req.user!.userId;

      const result = await this.generateAIRoadmapUseCase.execute(
        {
          workspaceId,
          articleIds,
          targetAudience,
          focusAreas,
          estimatedWeeks,
        },
        userId
      );

      if (!result.isSuccess) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(201).json({
        message: 'AI roadmap generated successfully',
        data: result.getValue(),
      });
    } catch (error) {
      console.error('Generate AI roadmap error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate AI roadmap',
      });
    }
  }

  /**
   * GET /roadmaps/:roadmapId
   * Get roadmap with user progress
   */
  async getRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;
      const userId = req.user!.userId;

      const result = await this.getRoadmapUseCase.execute(roadmapId, userId);

      if (!result.isSuccess) {
        return res.status(404).json({
          error: 'Not Found',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Roadmap retrieved successfully',
        data: result.getValue(),
      });
    } catch (error) {
      console.error('Get roadmap error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get roadmap',
      });
    }
  }

  /**
   * GET /workspaces/:workspaceId/roadmaps
   * List all roadmaps in workspace
   */
  async listWorkspaceRoadmaps(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const onlyPublished = req.query.published === 'true';

      const result = await this.listWorkspaceRoadmapsUseCase.execute(workspaceId, onlyPublished);

      if (!result.isSuccess) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Roadmaps retrieved successfully',
        data: result.getValue(),
      });
    } catch (error) {
      console.error('List roadmaps error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list roadmaps',
      });
    }
  }

  /**
   * PUT /roadmaps/:roadmapId/progress
   * Update user progress on a roadmap step
   */
  async updateProgress(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;
      const { stepOrder, resourceTitle, completeStep, notes } = req.body;
      const userId = req.user!.userId;

      const result = await this.updateProgressUseCase.execute(
        roadmapId,
        { stepOrder, resourceTitle, completeStep, notes },
        userId
      );

      if (!result.isSuccess) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Progress updated successfully',
      });
    } catch (error) {
      console.error('Update progress error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update progress',
      });
    }
  }

  /**
   * POST /roadmaps/:roadmapId/resources
   * Add a learning resource to a step
   */
  async addResource(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;
      const { stepOrder, title, type, url, description, estimatedDuration, difficulty } = req.body;

      const result = await this.addResourceUseCase.execute(roadmapId, {
        stepOrder,
        title,
        type,
        url,
        description,
        estimatedDuration,
        difficulty,
      });

      if (!result.isSuccess) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Resource added successfully',
      });
    } catch (error) {
      console.error('Add resource error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to add resource',
      });
    }
  }

  /**
   * PUT /roadmaps/:roadmapId/publish
   * Publish a roadmap
   */
  async publishRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;

      const result = await this.publishRoadmapUseCase.execute(roadmapId);

      if (!result.isSuccess) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Roadmap published successfully',
      });
    } catch (error) {
      console.error('Publish roadmap error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to publish roadmap',
      });
    }
  }
}
