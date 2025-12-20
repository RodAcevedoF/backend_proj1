import { Request, Response } from 'express';
import { IResourceService } from '@/features/resource/domain/ports/inbound/iresource.service';

export class ResourceController {
  constructor(private readonly resourceService: IResourceService) {}

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      const result = await this.resourceService.create({
        ...req.body,
        workspaceId,
        userId,
      });

      return res.status(201).json({
        message: 'Resource created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Create resource error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create resource',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { resourceId } = req.params;

      const result = await this.resourceService.getById({ id: resourceId });

      return res.status(200).json({
        message: 'Resource retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }
      console.error('Get resource error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get resource',
      });
    }
  }

  async findByWorkspace(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;

      const result = await this.resourceService.findByWorkspace({ workspaceId });

      return res.status(200).json({
        message: 'Resources retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Find resources by workspace error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to find resources',
      });
    }
  }

  async findResources(req: Request, res: Response): Promise<Response> {
    try {
      const {
        workspaceId,
        userId,
        type,
        types,
        status,
        source,
        categoryIds,
        tags,
        search,
        page,
        limit,
        sortField,
        sortOrder,
      } = req.query;

      const result = await this.resourceService.findResources({
        workspaceId: workspaceId as string,
        userId: userId as string,
        type: type as any,
        types: types ? (types as string).split(',') as any : undefined,
        status: status as any,
        source: source as any,
        categoryIds: categoryIds ? (categoryIds as string).split(',') : undefined,
        tags: tags ? (tags as string).split(',') : undefined,
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortField: sortField as any,
        sortOrder: sortOrder as any,
      });

      return res.status(200).json({
        message: 'Resources retrieved successfully',
        ...result,
      });
    } catch (error) {
      console.error('Find resources error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to find resources',
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { resourceId } = req.params;

      const result = await this.resourceService.update({
        id: resourceId,
        ...req.body,
      });

      return res.status(200).json({
        message: 'Resource updated successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }
      console.error('Update resource error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update resource',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { resourceId } = req.params;

      await this.resourceService.delete({ id: resourceId });

      return res.status(200).json({
        message: 'Resource deleted successfully',
      });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return res.status(404).json({
          error: 'Not Found',
          message: error.message,
        });
      }
      console.error('Delete resource error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete resource',
      });
    }
  }

  async bulkInsert(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      const resources = req.body.resources.map((resource: any) => ({
        ...resource,
        workspaceId,
        userId,
      }));

      const result = await this.resourceService.bulkInsert({ resources });

      return res.status(201).json({
        message: 'Resources created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Bulk insert resources error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to bulk insert resources',
      });
    }
  }
}
