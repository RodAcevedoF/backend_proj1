import { Category } from '@/features/category/domain/Category';

interface CategoryDocument {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryMapper {
  static toDomain(doc: CategoryDocument): Category {
    return Category.from(doc._id, {
      workspaceId: doc.workspaceId,
      name: doc.name,
      description: doc.description,
      color: doc.color,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(category: Category): CategoryDocument {
    const p = category.toPrimitives();
    return {
      _id: p.id,
      workspaceId: p.workspaceId,
      name: p.name,
      description: p.description,
      color: p.color,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
