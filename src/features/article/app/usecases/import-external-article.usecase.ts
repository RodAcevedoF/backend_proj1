import { IScientificArticlesProvider } from '../../domain/ports/outbound/iscientific-article-provider';
import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import { IArticleEnrichmentLLM } from '../../domain/ports/outbound/iarticle-enrichment-llm';
import { Article } from '../../domain/Article';
import { randomUUID } from 'crypto';
import { ImportExternalArticleDTO } from '../dtos/import-external-article.dto';

export class ImportExternalArticleUsecase {
  constructor(
    private provider: IScientificArticlesProvider,
    private llm: IArticleEnrichmentLLM,
    private repo: IArticleRepository
  ) {}

  async execute(input: ImportExternalArticleDTO): Promise<Article> {
    const externalArticle = await this.provider.getById(input.externalId);

    const summary = await this.llm.summarize(externalArticle.abstract);
    const keywords = await this.llm.extractKeywords(externalArticle.abstract);
    const classifications = await this.llm.classify(externalArticle.abstract);

    const article = new Article({
      id: randomUUID(),
      workspaceId: input.workspaceId,
      userId: input.userId,
      title: externalArticle.title,
      content: externalArticle.abstract,
      tags: [...keywords],
      status: 'enriched',
      source: 'semantic-scholar',
      externalId: externalArticle.id,
      summary,
      categories: [...classifications],
      url: `https://www.semanticscholar.org/paper/${externalArticle.id}`,
      authors: externalArticle.authors,
      publishedAt: new Date(externalArticle.publishedAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.repo.save(article);

    return article;
  }
}
