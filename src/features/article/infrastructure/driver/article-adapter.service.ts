import { IArticleService } from '../../app/IArticle.service';
import { CreateArticleUseCase } from '../../app/usecases/create-article.usecase';
import { GetArticleByIdUseCase } from '../../app/usecases/get-by-id.usecase';

export class ArticleServiceAdapter implements IArticleService {
  constructor(
    private createArticle: CreateArticleUseCase,
    private getArticleById: GetArticleByIdUseCase
  ) {}

  create(input: {
    title: string;
    content: string;
    workspaceId: string;
    tags?: string[];
  }) {
    return this.createArticle.execute(input);
  }

  getById(id: string) {
    return this.getArticleById.execute(id);
  }
}
