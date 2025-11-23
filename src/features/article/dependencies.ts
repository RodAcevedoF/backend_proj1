import { CreateArticleUseCase } from './app/usecases/create-article.usecase';
import { GetArticleByIdUseCase } from './app/usecases/get-by-id.usecase';
import { InMemoryArticleRepository } from './infrastructure/driven/in-memory.repository';
import { ArticleServiceAdapter } from './infrastructure/driver/article-adapter.service';
import { ArticleController } from './infrastructure/driver/http/article.http.controller';

export type ArticleDependencies = {
  articleRepository: InMemoryArticleRepository;
  createUseCase: CreateArticleUseCase;
  getByIdUseCase: GetArticleByIdUseCase;
  articleService: ArticleServiceAdapter;
  articleController: ArticleController;
};

export function makeArticleDependencies(): ArticleDependencies {
  const articleRepository = new InMemoryArticleRepository();

  const createUseCase = new CreateArticleUseCase(articleRepository);
  const getByIdUseCase = new GetArticleByIdUseCase(articleRepository);

  const articleService = new ArticleServiceAdapter(
    createUseCase,
    getByIdUseCase
  );

  const articleController = new ArticleController(articleService);

  return {
    articleRepository,
    createUseCase,
    getByIdUseCase,
    articleService,
    articleController,
  };
}

export const defaultArticleDependencies = makeArticleDependencies();
