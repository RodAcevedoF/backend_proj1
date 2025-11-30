import type { ArticleProps } from '@/features/article/domain/Article';

export function toMongoDoc(p: ArticleProps) {
  return {
    _id: p.id,
    workspaceId: p.workspaceId,
    title: p.title,
    content: p.content,
    tags: p.tags,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function fromMongoDoc(doc: any): ArticleProps {
  return {
    id: doc._id,
    workspaceId: doc.workspaceId,
    title: doc.title,
    content: doc.content,
    tags: doc.tags ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
