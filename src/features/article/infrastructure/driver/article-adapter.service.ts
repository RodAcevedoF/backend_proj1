import { IArticleService } from '../../app/IArticle.service';
import { CreateArticleUseCase } from '../../app/usecases/create-article.usecase';
import { GetArticleByIdUseCase } from '../../app/usecases/get-by-id.usecase';
import { CreateArticleDTO } from '../../app/dtos/create-article.dto';
import { ArticleResponseDTO } from '../../app/dtos/article-response.dto';

export class ArticleServiceAdapter implements IArticleService {
  constructor(
    private createArticle: CreateArticleUseCase,
    private getArticleById: GetArticleByIdUseCase
  ) {}

  async create(input: CreateArticleDTO): Promise<ArticleResponseDTO> {
    const created = await this.createArticle.execute(input as any);
    return mapToResponseDTO(created);
  }

  async getById(id: string): Promise<ArticleResponseDTO> {
    const found = await this.getArticleById.execute(id);
    return mapToResponseDTO(found);
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
