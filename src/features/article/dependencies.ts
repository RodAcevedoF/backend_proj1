import { BulkInsertArticlesUseCase } from './app/usecases/bulk-insert.usecase';
import { CreateArticleUseCase } from './app/usecases/create-article.usecase';
import { DeleteArticleUseCase } from './app/usecases/delete-article';
import { FindArticlesByWorkspaceUseCase } from './app/usecases/find-by-workspace';
import { GetArticleByIdUseCase } from './app/usecases/get-article.usecase';
import { UpdateArticleUseCase } from './app/usecases/update-article.usecase';
import { MongoArticleRepository } from './infrastructure/adapters/driven/repositories/mongo.repository';
import { ArticleServiceAdapter } from './infrastructure/adapters/driver/article-adapter.service';
import { ArticleController } from './infrastructure/adapters/driver/http/article.http.controller';

export type ArticleDependencies = {
  articleRepository: MongoArticleRepository;
  createUseCase: CreateArticleUseCase;
  getByIdUseCase: GetArticleByIdUseCase;
  findByWorkspaceUseCase: FindArticlesByWorkspaceUseCase;
  bulkInsertUseCase: BulkInsertArticlesUseCase;
  updateUseCase: UpdateArticleUseCase;
  deleteUseCase: DeleteArticleUseCase;
  articleService: ArticleServiceAdapter;
  articleController: ArticleController;
};

export function makeArticleDependencies(): ArticleDependencies {
  const articleRepository = new MongoArticleRepository();

  const createUseCase = new CreateArticleUseCase(articleRepository);
  const getByIdUseCase = new GetArticleByIdUseCase(articleRepository);
  const findByWorkspaceUseCase = new FindArticlesByWorkspaceUseCase(
    articleRepository
  );
  const bulkInsertUseCase = new BulkInsertArticlesUseCase(articleRepository);
  const updateUseCase = new UpdateArticleUseCase(articleRepository);
  const deleteUseCase = new DeleteArticleUseCase(articleRepository);

  const articleService = new ArticleServiceAdapter(
    createUseCase,
    getByIdUseCase,
    updateUseCase,
    findByWorkspaceUseCase,
    bulkInsertUseCase,
    deleteUseCase
  );

  const articleController = new ArticleController(articleService);

  return {
    articleRepository,
    createUseCase,
    getByIdUseCase,
    findByWorkspaceUseCase,
    bulkInsertUseCase,
    updateUseCase,
    deleteUseCase,
    articleService,
    articleController,
  };
}

export const defaultArticleDependencies = makeArticleDependencies();
