import { IArticleRepository } from '@/features/article/domain/ports/outbound/iarticle.repository';
import { randomUUID } from 'crypto';
import { Article } from '../../domain/Article';
import { CreateArticleDTO } from '../dtos/create-article.dto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export class CreateArticleUseCase {
  constructor(private readonly repo: IArticleRepository) {}

  async execute(input: CreateArticleDTO): Promise<ArticleResponseDTO> {
    const article = new Article({
      id: randomUUID(),
      workspaceId: input.workspaceId,
      userId: input.userId,
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      categoryIds: input.categoryIds ?? [],
      status: input.status ?? 'user_created',
      source: input.source ?? 'user',
      externalId: input.externalId,
      summary: input.summary,
      aiCategories: input.aiCategories,
      url: input.url,
      authors: input.authors,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repo.save(article);

    const primitives = article.toPrimitives();
    return {
      ...primitives,
      publishedAt: primitives.publishedAt?.toISOString(),
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
