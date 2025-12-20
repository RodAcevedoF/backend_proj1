import { Request, Response } from 'express';
import { IArticleService } from '@/features/article/domain/ports/inbound/iarticle.service';
import { CreateArticleDTO } from '@/features/article/app/dtos/create-article.dto';
import { FindArticlesDTO } from '@/features/article/app/dtos/find-by-workspace.dto';

export class ArticleController {
  constructor(private readonly service: IArticleService) {}

  /**
   * GET /articles
   * Public paginated list - can filter by workspace, status, etc.
   */  
  getAll = async (req: Request, res: Response) => {
    try {
      const filters: FindArticlesDTO = {
        workspaceId: req.query.workspaceId as string | undefined,
        status: req.query.status as FindArticlesDTO['status'],
        source: req.query.source as FindArticlesDTO['source'],
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await this.service.findArticles(filters);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * GET /articles/:id
   * Public - get single article by ID
   */
  getById = async (req: Request, res: Response) => {
    try {
      const article = await this.service.getById({ id: req.params.id });
      res.json(article);
    } catch (err) {
      res.status(404).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * POST /articles
   * Protected - requires auth + workspace editor role
   */
  create = async (req: Request, res: Response) => {
    try {
      const dto: CreateArticleDTO = {
        title: req.body.title,
        content: req.body.content,
        workspaceId: req.body.workspaceId,
        tags: req.body.tags,
        userId: req.user!.userId,
      };

      if (!dto.workspaceId) {
        return res.status(400).json({ error: 'workspaceId is required' });
      }

      const article = await this.service.create(dto);
      res.status(201).json(article);
    } catch (err) {
      res.status(400).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * PUT /articles/:id
   * Protected - requires auth + workspace editor role
   */
  update = async (req: Request, res: Response) => {
    try {
      const article = await this.service.update({
        id: req.params.id,
        ...req.body,
        userId: req.user!.userId,
      });
      res.json(article);
    } catch (err) {
      res.status(400).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * DELETE /articles/:id
   * Protected - requires auth + workspace editor role
   */
  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete({
        id: req.params.id,
        userId: req.user!.userId,
      });
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * GET /articles/external/search
   * Protected - search external sources (Semantic Scholar, etc.)
   */
  searchExternal = async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;

      if (!query) {
        return res.status(400).json({ error: 'query parameter is required' });
      }

      const results = await this.service.searchExternalArticles({ query });
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * POST /articles/external/import
   * Protected - import article from external source
   */
  importExternal = async (req: Request, res: Response) => {
    try {
      const { externalId, workspaceId } = req.body;

      if (!externalId) {
        return res.status(400).json({ error: 'externalId is required' });
      }

      if (!workspaceId) {
        return res.status(400).json({ error: 'workspaceId is required' });
      }

      const article = await this.service.importExternalArticle({
        externalId,
        workspaceId,
        userId: req.user!.userId,
      });
      res.status(201).json(article);
    } catch (err) {
      res.status(500).json({ error: this.getErrorMessage(err) });
    }
  };

  /**
   * POST /articles/import
   * Protected - import from CSV/Excel file
   */
  importFile = async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ error: 'workspaceId is required' });
      }

      if (!req.uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const enrich = req.body.enrich === 'true' || req.body.enrich === true;

      const result = await this.service.importFromFile({
        workspaceId,
        userId: req.user!.userId,
        file: {
          buffer: req.uploadedFile.buffer,
          mimeType: req.uploadedFile.mimeType,
          originalName: req.uploadedFile.originalName,
        },
        options: { enrich },
      });

      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: this.getErrorMessage(err) });
    }
  };

  private getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
