import { IArticleService } from '@/features/article/app/IArticle.service';

export class ArticleController {
  constructor(private service: IArticleService) {}

  create = async (req: any, res: any) => {
    try {
      const { title, content } = req.body;
      const article = await this.service.create({ title, content });
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
}
