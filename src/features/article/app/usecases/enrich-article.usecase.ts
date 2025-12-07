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
    // Get the raw external article
    const article = await this.repo.findById(input.articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    if (article.status !== 'external_raw') {
      throw new Error('Only external raw articles can be enriched');
    }

    // Enrich with AI
    const [summary, keywords, categories] = await Promise.all([
      this.llm.summarize(article.content),
      this.llm.extractKeywords(article.content),
      this.llm.classify(article.content),
    ]);

    // Update article with enriched data
    const primitives = article.toPrimitives();
    const enrichedArticle = new Article({
      ...primitives,
      status: 'enriched',
      summary,
      tags: [...primitives.tags, ...keywords],
      categories,
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
