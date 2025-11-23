import { Article } from '@/features/article/domain/Article';

export interface IArticleRepository {
  findById(id: string): Promise<Article | null>;
  findByWorkspace(workspaceId: string): Promise<Article[]>;
  save(article: Article): Promise<void>;
  bulkInsert(articles: Article[]): Promise<void>;
}
