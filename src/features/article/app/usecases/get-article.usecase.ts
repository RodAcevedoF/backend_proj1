import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import { GetArticleDTO } from '../dtos/get-article.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class GetArticleByIdUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: GetArticleDTO): Promise<ArticleResponseDTO> {
    const article = await this.repo.findById(input.id);
    if (!article) throw new Error('Not found');
    const primitives = article.toPrimitives();
    return {
      ...primitives,
      publishedAt: primitives.publishedAt?.toISOString(),
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
