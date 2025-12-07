import {
  IArticleRepository,
  ArticleQueryFilters,
  PaginationOptions,
  PaginatedResult,
} from '@/features/article/domain/ports/outbound/iarticle.repository';
import { Article } from '@/features/article/domain/Article';
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

  async findWithFilters(
    filters: ArticleQueryFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Article>> {
    const query: any = {};

    if (filters.workspaceId) query.workspaceId = filters.workspaceId;
    if (filters.userId) query.userId = filters.userId;
    if (filters.status) query.status = filters.status;
    if (filters.source) query.source = filters.source;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      ArticleModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      ArticleModel.countDocuments(query).exec(),
    ]);

    const data = docs.map((d) => new Article(toDomain(d as any)));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async bulkInsert(articles: Article[]): Promise<void> {
    const docs = articles.map((a) => toPersistence(a.toPrimitives()));
    await ArticleModel.insertMany(docs);
  }

  async deleteById(id: string): Promise<void> {
    await ArticleModel.deleteOne({ _id: id }).exec();
  }
}
