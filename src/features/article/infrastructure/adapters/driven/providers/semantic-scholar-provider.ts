import axios from 'axios';
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
  publicationDate?: string;
}

interface SemanticScholarSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: SemanticScholarPaper[];
}

export class SemanticScholarProvider implements IScientificArticlesProvider {
  private BASE_URL = 'https://api.semanticscholar.org/graph/v1';

  async getById(id: string): Promise<ScientificArticleDTO> {
    const response = await axios.get<SemanticScholarPaper>(
      `${this.BASE_URL}/paper/${id}?fields=title,abstract,authors,publicationDate`
    );

    const data = response.data;

    return {
      id: data.paperId,
      title: data.title,
      abstract: data.abstract ?? '',
      authors: data.authors.map((author) => author.name),
      publishedAt: data.publicationDate ?? new Date().toISOString(),
      source: 'semantic-scholar',
    };
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    const response = await axios.get<SemanticScholarSearchResponse>(
      `${this.BASE_URL}/paper/search?query=${encodeURIComponent(
        query
      )}&fields=title,abstract,authors,publicationDate&limit=${limit}&offset=${offset}`
    );

    const articles = response.data.data.map((item) => ({
      id: item.paperId,
      title: item.title,
      abstract: item.abstract ?? '',
      authors: item.authors.map((author) => author.name),
      publishedAt: item.publicationDate ?? new Date().toISOString(),
      source: 'semantic-scholar',
    }));

    return {
      articles,
      total: response.data.total,
      hasMore: response.data.next !== undefined,
    };
  }
}
