import type { ArticleProps } from '@/features/article/domain/Article';
import type { HydratedDocument } from 'mongoose';
import type { ArticleDocument } from './schema';

/**
 * Converts a Mongoose document to domain ArticleProps
 */
export function toDomain(doc: HydratedDocument<ArticleDocument>): ArticleProps {
  return {
    id: doc._id,
    workspaceId: doc.workspaceId ?? undefined,
    userId: doc.userId ?? undefined,
    title: doc.title,
    content: doc.content,
    tags: doc.tags ?? [],
    status: doc.status || 'user_created',
    source: doc.source || 'user',
    externalId: doc.externalId ?? undefined,
    summary: doc.summary ?? undefined,
    categories: doc.categories ?? [],
    url: doc.url ?? undefined,
    authors: doc.authors ?? [],
    publishedAt: doc.publishedAt
      ? doc.publishedAt instanceof Date
        ? doc.publishedAt
        : new Date(doc.publishedAt)
      : undefined,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
  };
}

/**
 * Converts domain ArticleProps to Mongoose persistence format
 */
export function toPersistence(props: ArticleProps): Record<string, any> {
  return {
    _id: props.id,
    workspaceId: props.workspaceId,
    userId: props.userId,
    title: props.title,
    content: props.content,
    tags: props.tags,
    status: props.status,
    source: props.source,
    externalId: props.externalId,
    summary: props.summary,
    categories: props.categories,
    url: props.url,
    authors: props.authors,
    publishedAt: props.publishedAt,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
  };
}
