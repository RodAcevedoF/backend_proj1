import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import { FindByWorkspaceDTO } from '../dtos/find-by-workspace.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class FindArticlesByWorkspaceUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: FindByWorkspaceDTO): Promise<ArticleResponseDTO[]> {
    const articles = await this.repo.findByWorkspace(input.workspaceId);
    return articles.map((article) => {
      const primitives = article.toPrimitives();
      return {
        ...primitives,
        createdAt: primitives.createdAt.toISOString(),
        updatedAt: primitives.updatedAt.toISOString(),
      };
    });
  }
}
