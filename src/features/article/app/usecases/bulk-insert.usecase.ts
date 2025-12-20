import { IArticleRepository } from '@/features/article/domain/ports/outbound/iarticle.repository';
import { Article } from '../../domain/Article';
import { BulkInsertArticlesDTO } from '../dtos/bulk-insert-articles.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';
import { randomUUID } from 'crypto';

export class BulkInsertArticlesUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: BulkInsertArticlesDTO): Promise<ArticleResponseDTO[]> {
    const articles = input.articles.map(
      (articleData) =>
        new Article({
          id: randomUUID(),
          workspaceId: articleData.workspaceId,
          userId: articleData.userId,
          title: articleData.title,
          content: articleData.content,
          tags: articleData.tags ?? [],
          categoryIds: articleData.categoryIds ?? [],
          status: articleData.status ?? 'user_created',
          source: articleData.source ?? 'user',
          externalId: articleData.externalId,
          summary: articleData.summary,
          aiCategories: articleData.aiCategories,
          url: articleData.url,
          authors: articleData.authors,
          publishedAt: articleData.publishedAt
            ? new Date(articleData.publishedAt)
            : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    );

    await this.repo.bulkInsert(articles);

    return articles.map((article) => {
      const primitives = article.toPrimitives();
      return {
        ...primitives,
        publishedAt: primitives.publishedAt?.toISOString(),
        createdAt: primitives.createdAt.toISOString(),
        updatedAt: primitives.updatedAt.toISOString(),
      };
    });
  }
}
