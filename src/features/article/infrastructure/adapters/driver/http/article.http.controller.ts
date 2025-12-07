import { IArticleService } from '@/features/article/app/iarticle.service';
import { CreateArticleDTO } from '@/features/article/app/dtos/create-article.dto';

export class ArticleController {
  constructor(private readonly service: IArticleService) {}

  create = async (req: any, res: any) => {
    try {
      const { title, content, workspaceId, tags } =
        req.body as CreateArticleDTO;

      if (!workspaceId) {
        return res.status(400).json({ error: 'workspaceId is required' });
      }

      const article = await this.service.create({
        title,
        content,
        workspaceId,
        tags,
      });
      res.status(201).json(article);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getById = async (req: any, res: any) => {
    try {
      const id = req.params.id;
      const article = await this.service.getById(id);
      res.json(article);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  };

  searchExternal = async (req: any, res: any) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'query parameter is required' });
      }

      const articles = await this.service.searchExternalArticles({ query });
      res.json(articles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  importExternal = async (req: any, res: any) => {
    try {
      const { externalId, workspaceId, userId } = req.body;

      if (!externalId) {
        return res.status(400).json({ error: 'externalId is required' });
      }

      const article = await this.service.importExternalArticle({
        externalId,
        workspaceId,
        userId,
      });
      res.status(201).json(article);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
