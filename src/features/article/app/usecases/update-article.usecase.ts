import { IArticleRepository } from '@/features/article/domain/ports/outbound/iarticle.repository';
import { Article } from '../../domain/Article';
import { UpdateArticleDTO } from '../dtos/update-article.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class UpdateArticleUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: UpdateArticleDTO): Promise<ArticleResponseDTO> {
    const article = await this.repo.findById(input.id);
    if (!article) throw new Error('Not found');

    const base = article.toPrimitives();
    const merged = {
      ...base,
      ...(input.title && { title: input.title }),
      ...(input.content && { content: input.content }),
      ...(input.tags && { tags: input.tags }),
      updatedAt: new Date(),
    };

    const updatedArticle = new Article(merged);
    await this.repo.save(updatedArticle);

    const primitives = updatedArticle.toPrimitives();
    return {
      ...primitives,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
