import { IArticleRepository } from '@/features/article/domain/ports/outbound/iarticle.repository';
import { Article } from '../../domain/Article';
import { BulkInsertArticlesDTO } from '../dtos/bulk-insert-articles.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class BulkInsertArticlesUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: BulkInsertArticlesDTO): Promise<ArticleResponseDTO[]> {
    const articles = input.articles.map(
      (articleData) =>
        new Article({
          id: articleData.id,
          workspaceId: articleData.workspaceId,
          title: articleData.title,
          content: articleData.content,
          tags: articleData.tags ?? [],
          createdAt: new Date(articleData.createdAt),
          updatedAt: new Date(articleData.updatedAt),
        })
    );

    await this.repo.bulkInsert(articles);

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
