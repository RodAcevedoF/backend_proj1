import { IArticleRepository } from '@/features/article/domain/ports/outbound/IArticle.port';
import { Article } from '../../domain/Article';

export class InMemoryArticleRepository implements IArticleRepository {
  private store = new Map<string, Article>();

  async save(article: Article): Promise<void> {
    this.store.set(article.id, article);
  }

  async findById(id: string): Promise<Article | null> {
    return this.store.get(id) ?? null;
  }

  async findByWorkspace(workspaceId: string): Promise<Article[]> {
    const articles: Article[] = [];
    for (const article of this.store.values()) {
      if (article.workspaceId === workspaceId) {
        articles.push(article);
      }
    }
    return articles;
  }

  async bulkInsert(articles: Article[]): Promise<void> {
    for (const article of articles) {
      this.store.set(article.id, article);
    }
  }
}
