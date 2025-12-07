import { IArticleService } from '../../../app/iarticle.service';
import { CreateArticleUseCase } from '../../../app/usecases/create-article.usecase';
import { GetArticleByIdUseCase } from '../../../app/usecases/get-article.usecase';
import { CreateArticleDTO } from '../../../app/dtos/create-article.dto';
import { ArticleResponseDTO } from '../../../app/dtos/article-response.dto';
import { GetArticleDTO } from '../../../app/dtos/get-article.dto';
import { UpdateArticleUseCase } from '../../../app/usecases/update-article.usecase';
import { FindArticlesByWorkspaceUseCase } from '../../../app/usecases/find-by-workspace';
import { FindArticlesUseCase } from '../../../app/usecases/find-articles.usecase';
import { BulkInsertArticlesUseCase } from '../../../app/usecases/bulk-insert.usecase';
import { DeleteArticleUseCase } from '../../../app/usecases/delete-article';
import { UpdateArticleDTO } from '../../../app/dtos/update-article.dto';
import { BulkInsertArticlesDTO } from '../../../app/dtos/bulk-insert-articles.dto';
import { DeleteArticleDTO } from '../../../app/dtos/delete-article.dto';
import {
  FindByWorkspaceDTO,
  FindArticlesDTO,
  PaginatedArticlesResponseDTO,
} from '../../../app/dtos/find-by-workspace.dto';
import { ImportExternalArticleUsecase } from '@/features/article/app/usecases/import-external-article.usecase';
import { SearchExternalArticlesUseCase } from '@/features/article/app/usecases/search-external-articles.usecase';
import { ImportExternalArticleDTO } from '@/features/article/app/dtos/import-external-article.dto';
import { SearchExternalArticlesDTO } from '@/features/article/app/dtos/search-external-articles.dto';
import { SearchResult } from '@/features/article/domain/ports/outbound/iscientific-article-provider';

export class ArticleServiceAdapter implements IArticleService {
  constructor(
    private readonly createArticle: CreateArticleUseCase,
    private readonly getArticleById: GetArticleByIdUseCase,
    private readonly updateArticle: UpdateArticleUseCase,
    private readonly findArticlesByWorkspace: FindArticlesByWorkspaceUseCase,
    private readonly findArticlesUseCase: FindArticlesUseCase,
    private readonly bulkInsertArticles: BulkInsertArticlesUseCase,
    private readonly deleteArticle: DeleteArticleUseCase,
    private readonly importExternal: ImportExternalArticleUsecase,
    private readonly searchExternal: SearchExternalArticlesUseCase
  ) {}

  async create(input: CreateArticleDTO): Promise<ArticleResponseDTO> {
    return await this.createArticle.execute(input);
  }

  async getById(input: GetArticleDTO): Promise<ArticleResponseDTO> {
    return await this.getArticleById.execute(input);
  }

  async update(input: UpdateArticleDTO): Promise<ArticleResponseDTO> {
    return await this.updateArticle.execute(input);
  }

  async findByWorkspace(
    input: FindByWorkspaceDTO
  ): Promise<ArticleResponseDTO[]> {
    return await this.findArticlesByWorkspace.execute(input);
  }

  async findArticles(
    input: FindArticlesDTO
  ): Promise<PaginatedArticlesResponseDTO<ArticleResponseDTO>> {
    return await this.findArticlesUseCase.execute(input);
  }

  async bulkWrite(input: BulkInsertArticlesDTO): Promise<ArticleResponseDTO[]> {
    return await this.bulkInsertArticles.execute(input);
  }

  async delete(input: DeleteArticleDTO): Promise<void> {
    await this.deleteArticle.execute(input);
  }

  async searchExternalArticles(
    input: SearchExternalArticlesDTO
  ): Promise<SearchResult> {
    return await this.searchExternal.execute(input);
  }

  async importExternalArticle(
    input: ImportExternalArticleDTO
  ): Promise<ArticleResponseDTO> {
    const article = await this.importExternal.execute(input);
    const primitives = article.toPrimitives();
    return {
      ...primitives,
      publishedAt: primitives.publishedAt?.toISOString(),
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
