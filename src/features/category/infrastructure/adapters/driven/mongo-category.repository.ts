import { ICategoryRepository } from '@/features/category/domain/ports/outbound/icategory.repository';
import { Category } from '@/features/category/domain/Category';
import { CategoryModel } from './category.schema';
import { CategoryMapper } from './category.mapper';

export class MongoCategoryRepository implements ICategoryRepository {
  async save(category: Category): Promise<void> {
    const doc = CategoryMapper.toPersistence(category);
    await CategoryModel.updateOne({ _id: doc._id }, doc, { upsert: true });
  }

  async findById(id: string): Promise<Category | null> {
    const doc = await CategoryModel.findOne({ _id: id }).lean();
    if (!doc) return null;
    return CategoryMapper.toDomain(doc as any);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Category[]> {
    const docs = await CategoryModel.find({ workspaceId })
      .sort({ name: 1 })
      .lean();
    return docs.map((d) => CategoryMapper.toDomain(d as any));
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    if (ids.length === 0) return [];
    const docs = await CategoryModel.find({ _id: { $in: ids } }).lean();
    return docs.map((d) => CategoryMapper.toDomain(d as any));
  }

  async existsByNameInWorkspace(
    name: string,
    workspaceId: string
  ): Promise<boolean> {
    const count = await CategoryModel.countDocuments({
      workspaceId,
      name: { $regex: `^${name}$`, $options: 'i' },
    });
    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await CategoryModel.deleteOne({ _id: id });
  }
}
