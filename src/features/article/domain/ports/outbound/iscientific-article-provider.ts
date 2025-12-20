export interface ScientificArticleDTO {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedAt?: string;
  source: string;
  url?: string;
  venue?: string;
  citationCount?: number;
  categories?: string[];
}

export interface SearchOptions {
  limit?: number; // Default: 10
  offset?: number; // Default: 0
}

export interface SearchResult {
  articles: ScientificArticleDTO[];
  total: number;
  hasMore: boolean;
}

export interface IScientificArticlesProvider {
  getById(id: string): Promise<ScientificArticleDTO>;
  search(query: string, options?: SearchOptions): Promise<SearchResult>;
}
