import { IArticleRepository } from '../../../../domain/ports/outbound/iarticle.repository';
import { Article, type ArticleProps } from '../../../../domain/Article';
import { ArticleModel } from './mongo/schema';
import { toDomain, toPersistence } from './mongo/mappers';

export class MongoArticleRepository implements IArticleRepository {
  async save(article: Article): Promise<void> {
    const doc = toPersistence(article.toPrimitives());
    await ArticleModel.updateOne({ _id: doc._id }, doc, {
      upsert: true,
    }).exec();
  }

  async findById(id: string): Promise<Article | null> {
    const doc = await ArticleModel.findById(id).exec();
    if (!doc) return null;
    return new Article(toDomain(doc as any));
  }

  async findByWorkspace(workspaceId: string): Promise<Article[]> {
    const docs = await ArticleModel.find({ workspaceId }).exec();
    return docs.map((d) => new Article(toDomain(d as any)));
  }

  async bulkInsert(articles: Article[]): Promise<void> {
    const docs = articles.map((a) => toPersistence(a.toPrimitives()));
    await ArticleModel.insertMany(docs);
  }

  async deleteById(id: string): Promise<void> {
    await ArticleModel.deleteOne({ _id: id }).exec();
  }
}
