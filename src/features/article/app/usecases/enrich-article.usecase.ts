import { IArticleRepository } from '../../domain/ports/outbound/iarticle.repository';
import { IArticleEnrichmentLLM } from '../../domain/ports/outbound/iarticle-enrichment-llm';
import { Article } from '../../domain/Article';
import { ArticleResponseDTO } from '../dtos/article-response.dto';

export interface EnrichArticleDTO {
  articleId: string;
}

export class EnrichArticleUseCase {
  constructor(
    private readonly repo: IArticleRepository,
    private readonly llm: IArticleEnrichmentLLM
  ) {}

  async execute(input: EnrichArticleDTO): Promise<ArticleResponseDTO> {
    const article = await this.repo.findById(input.articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    if (article.status !== 'external_raw') {
      throw new Error('Only external raw articles can be enriched');
    }

    const primitives = article.toPrimitives();

    // Enrich with AI using structured output
    const enrichment = await this.llm.enrich({
      title: primitives.title,
      abstract: primitives.content,
      authors: primitives.authors,
    });

    // Update article with enriched data
    const enrichedArticle = new Article({
      ...primitives,
      status: 'enriched',
      summary: enrichment.summary,
      tags: [...new Set([...primitives.tags, ...enrichment.keywords])],
      aiCategories: enrichment.categories,
      updatedAt: new Date(),
    });

    await this.repo.save(enrichedArticle);

    const result = enrichedArticle.toPrimitives();
    return {
      ...result,
      publishedAt: result.publishedAt?.toISOString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }
}
