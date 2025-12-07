import { Request, Response } from 'express';
import { IRoadmapService } from '@/features/roadmap/domain/ports/inbound/Iroadmap.service';

/**
 * Roadmap HTTP Controller
 * Handles roadmap-related HTTP requests
 */
export class RoadmapController {
  constructor(private readonly roadmapService: IRoadmapService) {}

  async createRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const { title, description, sourceArticleIds } = req.body;
      const userId = req.user!.userId;

      const result = await this.roadmapService.create(
        { workspaceId, title, description, sourceArticleIds },
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

  async generateAIRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const { articleIds, targetAudience, focusAreas, estimatedWeeks } =
        req.body;
      const userId = req.user!.userId;

      const result = await this.roadmapService.generateAI(
        { workspaceId, articleIds, targetAudience, focusAreas, estimatedWeeks },
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

  async getRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;
      const userId = req.user!.userId;

      const result = await this.roadmapService.getById(roadmapId, userId);

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

  async listWorkspaceRoadmaps(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const onlyPublished = req.query.published === 'true';

      const result = await this.roadmapService.listByWorkspace(
        workspaceId,
        onlyPublished
      );

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

  async updateProgress(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;
      const { stepOrder, resourceTitle, completeStep, notes } = req.body;
      const userId = req.user!.userId;

      const result = await this.roadmapService.updateProgress(
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

  async addResource(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;
      const {
        stepOrder,
        title,
        type,
        url,
        description,
        estimatedDuration,
        difficulty,
      } = req.body;

      const result = await this.roadmapService.addResource(roadmapId, {
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

  async publishRoadmap(req: Request, res: Response): Promise<Response> {
    try {
      const { roadmapId } = req.params;

      const result = await this.roadmapService.publish(roadmapId);

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
