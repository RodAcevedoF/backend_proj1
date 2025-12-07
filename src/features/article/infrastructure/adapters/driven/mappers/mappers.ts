import type { ArticleProps } from '@/features/article/domain/Article';

export function toMongoDoc(p: ArticleProps) {
  return {
    _id: p.id,
    workspaceId: p.workspaceId,
    userId: p.userId,
    title: p.title,
    content: p.content,
    tags: p.tags,
    status: p.status,
    source: p.source,
    externalId: p.externalId,
    summary: p.summary,
    categories: p.categories,
    url: p.url,
    authors: p.authors,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function fromMongoDoc(doc: any): ArticleProps {
  return {
    id: doc._id,
    workspaceId: doc.workspaceId,
    userId: doc.userId,
    title: doc.title,
    content: doc.content,
    tags: doc.tags ?? [],
    status: doc.status || 'user_created',
    source: doc.source || 'user',
    externalId: doc.externalId,
    summary: doc.summary,
    categories: doc.categories ?? [],
    url: doc.url,
    authors: doc.authors ?? [],
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
