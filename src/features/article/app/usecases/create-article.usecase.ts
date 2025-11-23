import { IArticleRepository } from '@/features/article/domain/ports/outbound/IArticle.port';
import { randomUUID } from 'crypto';
import { Article } from '../../domain/Article';

interface Input {
  title: string;
  content: string;
  workspaceId: string;
  tags?: string[];
}

export class CreateArticleUseCase {
  constructor(private repo: IArticleRepository) {}

  async execute(input: Input) {
    const article = new Article({
      id: randomUUID(),
      workspaceId: input.workspaceId,
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repo.save(article);

    return article.toPrimitives();
  }
}
