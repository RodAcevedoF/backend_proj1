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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repo.save(article);

    const primitives = article.toPrimitives();
    return {
      ...primitives,
      createdAt: primitives.createdAt.toISOString(),
      updatedAt: primitives.updatedAt.toISOString(),
    };
  }
}
