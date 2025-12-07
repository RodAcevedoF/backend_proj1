import {
  Article,
  ArticleStatus,
  ArticleSource,
} from '@/features/article/domain/Article';

export interface ArticleQueryFilters {
  workspaceId?: string;
  userId?: string;
  status?: ArticleStatus;
  source?: ArticleSource;
  search?: string; // Search in title/content
}

export interface PaginationOptions {
  page: number; // 1-based
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IArticleRepository {
  findById(id: string): Promise<Article | null>;
  findByWorkspace(workspaceId: string): Promise<Article[]>;
  findWithFilters(
    filters: ArticleQueryFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Article>>;
  save(article: Article): Promise<void>;
  bulkInsert(articles: Article[]): Promise<void>;
  deleteById(id: string): Promise<void>;
}
