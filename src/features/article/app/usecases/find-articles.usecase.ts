import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import {
  FindArticlesDTO,
  PaginatedArticlesResponseDTO,
} from '../dtos/find-by-workspace.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class FindArticlesUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(
    input: FindArticlesDTO
  ): Promise<PaginatedArticlesResponseDTO<ArticleResponseDTO>> {
    const page = input.page || 1;
    const limit = input.limit || 20;

    const result = await this.repo.findWithFilters(
      {
        workspaceId: input.workspaceId,
        userId: input.userId,
        status: input.status,
        source: input.source,
        search: input.search,
      },
      { page, limit }
    );

    const data = result.data.map((article) => {
      const primitives = article.toPrimitives();
      return {
        ...primitives,
        publishedAt: primitives.publishedAt?.toISOString(),
        createdAt: primitives.createdAt.toISOString(),
        updatedAt: primitives.updatedAt.toISOString(),
      };
    });

    return {
      data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
