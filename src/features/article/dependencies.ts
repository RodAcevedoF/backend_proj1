import { BulkInsertArticlesUseCase } from './app/usecases/bulk-insert.usecase';
import { CreateArticleUseCase } from './app/usecases/create-article.usecase';
import { DeleteArticleUseCase } from './app/usecases/delete-article';
import { FindArticlesByWorkspaceUseCase } from './app/usecases/find-by-workspace';
import { FindArticlesUseCase } from './app/usecases/find-articles.usecase';
import { GetArticleByIdUseCase } from './app/usecases/get-article.usecase';
import { ImportExternalArticleUsecase } from './app/usecases/import-external-article.usecase';
import { ImportFileUseCase } from './app/usecases/import-file.usecase';
import { SearchExternalArticlesUseCase } from './app/usecases/search-external-articles.usecase';
import { UpdateArticleUseCase } from './app/usecases/update-article.usecase';
import { SpreadsheetParser } from './infrastructure/adapters/driven/parsers/spreadsheet-parser';
import { LangChainArticleEnrichment } from './infrastructure/adapters/driven/providers/langchain-article-enrichment';
import { SemanticScholarProvider } from './infrastructure/adapters/driven/providers/semantic-scholar-provider';
import { MongoArticleRepository } from './infrastructure/adapters/driven/repositories/mongo.repository';
import { ArticleServiceAdapter } from './infrastructure/adapters/driver/article-adapter.service';
import { ArticleController } from './infrastructure/adapters/driver/http/article.http.controller';

export type ArticleDependencies = {
  articleRepository: MongoArticleRepository;
  createUseCase: CreateArticleUseCase;
  getByIdUseCase: GetArticleByIdUseCase;
  findByWorkspaceUseCase: FindArticlesByWorkspaceUseCase;
  findArticlesUseCase: FindArticlesUseCase;
  bulkInsertUseCase: BulkInsertArticlesUseCase;
  updateUseCase: UpdateArticleUseCase;
  deleteUseCase: DeleteArticleUseCase;
  searchExternalUseCase: SearchExternalArticlesUseCase;
  importExternalUseCase: ImportExternalArticleUsecase;
  importFileUseCase: ImportFileUseCase;
  articleService: ArticleServiceAdapter;
  articleController: ArticleController;
};

export function makeArticleDependencies(): ArticleDependencies {
  const articleRepository = new MongoArticleRepository();
  const provider = new SemanticScholarProvider();
  const llm = new LangChainArticleEnrichment();

  const createUseCase = new CreateArticleUseCase(articleRepository);
  const getByIdUseCase = new GetArticleByIdUseCase(articleRepository);
  const findByWorkspaceUseCase = new FindArticlesByWorkspaceUseCase(
    articleRepository
  );
  const findArticlesUseCase = new FindArticlesUseCase(articleRepository);
  const bulkInsertUseCase = new BulkInsertArticlesUseCase(articleRepository);
  const updateUseCase = new UpdateArticleUseCase(articleRepository);
  const deleteUseCase = new DeleteArticleUseCase(articleRepository);
  const searchExternalUseCase = new SearchExternalArticlesUseCase(provider);
  const importExternalUseCase = new ImportExternalArticleUsecase(
    provider,
    llm,
    articleRepository
  );

  const fileParser = new SpreadsheetParser();
  const importFileUseCase = new ImportFileUseCase(
    fileParser,
    llm,
    articleRepository
  );

  const articleService = new ArticleServiceAdapter(
    createUseCase,
    getByIdUseCase,
    updateUseCase,
    findByWorkspaceUseCase,
    findArticlesUseCase,
    bulkInsertUseCase,
    deleteUseCase,
    importExternalUseCase,
    searchExternalUseCase,
    importFileUseCase
  );

  const articleController = new ArticleController(articleService);

  return {
    articleRepository,
    createUseCase,
    getByIdUseCase,
    findByWorkspaceUseCase,
    findArticlesUseCase,
    bulkInsertUseCase,
    updateUseCase,
    deleteUseCase,
    searchExternalUseCase,
    importExternalUseCase,
    importFileUseCase,
    articleService,
    articleController,
  };
}

export const defaultArticleDependencies = makeArticleDependencies();
