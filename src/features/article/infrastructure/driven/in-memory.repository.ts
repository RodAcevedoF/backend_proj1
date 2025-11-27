import { IArticleRepository } from '@/features/article/domain/ports/outbound/IArticle.port';
import { Article, type ArticleProps } from '../../domain/Article';

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

  async deleteById(id: string): Promise<void> {
    this.store.delete(id);
  }

  async updateById(
    id: string,
    updatedFields: Partial<ArticleProps>
  ): Promise<void> {
    const article = this.store.get(id);
    if (!article) return;

    const base = article.toPrimitives() as ArticleProps;
    const merged: ArticleProps = {
      ...base,
      ...updatedFields,
      updatedAt: new Date(),
    };

    const updatedArticle = new Article(merged);
    this.store.set(id, updatedArticle);
  }
}
