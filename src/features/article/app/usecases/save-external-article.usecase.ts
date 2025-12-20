import { IScientificArticlesProvider } from '../../domain/ports/outbound/iscientific-article-provider';
import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import { Article } from '../../domain/Article';
import { randomUUID } from 'crypto';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export interface SaveExternalArticleDTO {
  externalId: string;
  workspaceId?: string;
  userId?: string;
}

export class SaveExternalArticleUseCase {
  constructor(
    private provider: IScientificArticlesProvider,
    private repo: IArticleRepository
  ) {}

  async execute(input: SaveExternalArticleDTO): Promise<ArticleResponseDTO> {
    const externalArticle = await this.provider.getById(input.externalId);

    // Save as raw external article (not enriched)
    const article = new Article({
      id: randomUUID(),
      workspaceId: input.workspaceId,
      userId: input.userId,
      title: externalArticle.title,
      content: externalArticle.abstract,
      tags: [],
      categoryIds: [],
      status: 'external_raw',
      source: 'semantic-scholar',
      externalId: externalArticle.id,
      url: externalArticle.url || `https://www.semanticscholar.org/paper/${externalArticle.id}`,
      authors: externalArticle.authors,
      publishedAt: externalArticle.publishedAt ? new Date(externalArticle.publishedAt) : undefined,
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
