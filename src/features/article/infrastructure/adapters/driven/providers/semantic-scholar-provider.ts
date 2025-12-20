import axios, { AxiosInstance } from 'axios';
import {
  IScientificArticlesProvider,
  ScientificArticleDTO,
  SearchOptions,
  SearchResult,
} from '@/features/article/domain/ports/outbound/iscientific-article-provider';

interface SemanticScholarAuthor {
  authorId?: string;
  name: string;
}

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: SemanticScholarAuthor[];
  year?: number;
  publicationDate?: string;
  url?: string;
  venue?: string;
  citationCount?: number;
  fieldsOfStudy?: string[];
}

interface SemanticScholarSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: SemanticScholarPaper[];
}

/**
 * Semantic Scholar API Provider
 * Rate limit: 1 request per second with API key
 * @see https://www.semanticscholar.org/product/api/tutorial
 */
export class SemanticScholarProvider implements IScientificArticlesProvider {
  private readonly client: AxiosInstance;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1 second between requests

  constructor(apiKey?: string) {
    const key = apiKey || process.env.SEMANTIC_SCHOLAR_API_KEY;

    this.client = axios.create({
      baseURL: 'https://api.semanticscholar.org/graph/v1',
      headers: key ? { 'x-api-key': key } : {},
    });
  }

  /**
   * Enforce rate limit: 1 request per second
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - elapsed)
      );
    }

    this.lastRequestTime = Date.now();
  }

  async getById(id: string): Promise<ScientificArticleDTO> {
    await this.throttle();

    const fields = [
      'title',
      'abstract',
      'authors',
      'year',
      'publicationDate',
      'url',
      'venue',
      'citationCount',
      'fieldsOfStudy',
    ].join(',');

    const response = await this.client.get<SemanticScholarPaper>(
      `/paper/${id}?fields=${fields}`
    );

    return this.mapToDTO(response.data);
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    await this.throttle();

    const limit = Math.min(options?.limit || 10, 100); // API max is 100
    const offset = options?.offset || 0;

    const fields = [
      'title',
      'abstract',
      'authors',
      'year',
      'publicationDate',
      'url',
      'venue',
      'citationCount',
      'fieldsOfStudy',
    ].join(',');

    const response = await this.client.get<SemanticScholarSearchResponse>(
      `/paper/search`,
      {
        params: {
          query,
          fields,
          limit,
          offset,
        },
      }
    );

    const articles = response.data.data.map((item) => this.mapToDTO(item));

    return {
      articles,
      total: response.data.total,
      hasMore: response.data.next !== undefined,
    };
  }

  private mapToDTO(paper: SemanticScholarPaper): ScientificArticleDTO {
    return {
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract ?? '',
      authors: paper.authors.map((a) => a.name),
      publishedAt: paper.publicationDate || (paper.year ? `${paper.year}-01-01` : undefined),
      source: 'semantic-scholar',
      url: paper.url,
      venue: paper.venue,
      citationCount: paper.citationCount,
      categories: paper.fieldsOfStudy,
    };
  }
}
