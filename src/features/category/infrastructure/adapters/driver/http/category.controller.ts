import { Request, Response } from 'express';
import { ICategoryService } from '@/features/category/domain/ports/inbound/icategory.service';

export class CategoryController {
  constructor(private readonly categoryService: ICategoryService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const { workspaceId } = req.params;
      const { name, description, color } = req.body;

      if (!name) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Category name is required',
        });
      }

      const result = await this.categoryService.create({
        workspaceId,
        name,
        description,
        color,
        userId: req.user.userId,
      });

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(201).json({
        message: 'Category created successfully',
        data: result.getValue(),
      });
    } catch (error) {
      console.error('Create category error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create category',
      });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId } = req.params;
      const { name, description, color } = req.body;

      const result = await this.categoryService.update({
        id: categoryId,
        name,
        description,
        color,
      });

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Category updated successfully',
        data: result.getValue(),
      });
    } catch (error) {
      console.error('Update category error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update category',
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId } = req.params;

      const result = await this.categoryService.delete(categoryId);

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Delete category error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete category',
      });
    }
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspaceId } = req.params;

      const categories = await this.categoryService.listByWorkspace(workspaceId);

      return res.status(200).json({
        data: categories,
      });
    } catch (error) {
      console.error('List categories error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to list categories',
      });
    }
  };
}
