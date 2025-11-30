import { IArticleService } from '../../../app/iarticle.service';
import { CreateArticleUseCase } from '../../../app/usecases/create-article.usecase';
import { GetArticleByIdUseCase } from '../../../app/usecases/get-article.usecase';
import { CreateArticleDTO } from '../../../app/dtos/create-article.dto';
import { ArticleResponseDTO } from '../../../app/dtos/article-response.dto';
import { GetArticleDTO } from '../../../app/dtos/get-article.dto';
import { UpdateArticleUseCase } from '../../../app/usecases/update-article.usecase';
import { FindArticlesByWorkspaceUseCase } from '../../../app/usecases/find-by-workspace';
import { BulkInsertArticlesUseCase } from '../../../app/usecases/bulk-insert.usecase';
import { DeleteArticleUseCase } from '../../../app/usecases/delete-article';
import { UpdateArticleDTO } from '../../../app/dtos/update-article.dto';
import { BulkInsertArticlesDTO } from '../../../app/dtos/bulk-insert-articles.dto';
import { DeleteArticleDTO } from '../../../app/dtos/delete-article.dto';
import { FindByWorkspaceDTO } from '../../../app/dtos/find-by-workspace.dto';

export class ArticleServiceAdapter implements IArticleService {
  constructor(
    private readonly createArticle: CreateArticleUseCase,
    private readonly getArticleById: GetArticleByIdUseCase,
    private readonly updateArticle: UpdateArticleUseCase,
    private readonly findArticlesByWorkspace: FindArticlesByWorkspaceUseCase,
    private readonly bulkInsertArticles: BulkInsertArticlesUseCase,
    private readonly deleteArticle: DeleteArticleUseCase
  ) {}

  async create(input: CreateArticleDTO): Promise<ArticleResponseDTO> {
    const created = await this.createArticle.execute(input as any);
    return mapToResponseDTO(created);
  }

  async getById(input: GetArticleDTO): Promise<ArticleResponseDTO> {
    const found = await this.getArticleById.execute(input);
    return mapToResponseDTO(found);
  }

  async update(input: UpdateArticleDTO): Promise<ArticleResponseDTO> {
    const updated = await this.updateArticle.execute(input);
    return mapToResponseDTO(updated);
  }

  async findByWorkspace(
    input: FindByWorkspaceDTO
  ): Promise<ArticleResponseDTO[]> {
    const found = await this.findArticlesByWorkspace.execute(input);
    return found.map((p) => mapToResponseDTO(p));
  }

  async bulkWrite(input: BulkInsertArticlesDTO): Promise<ArticleResponseDTO[]> {
    const createdArticles = await this.bulkInsertArticles.execute(input);
    return createdArticles.map((p) => mapToResponseDTO(p));
  }

  async delete(input: DeleteArticleDTO): Promise<void> {
    await this.deleteArticle.execute(input);
  }
}

function mapToResponseDTO(p: any): ArticleResponseDTO {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    title: p.title,
    content: p.content,
    tags: p.tags ?? [],
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
  };
}
