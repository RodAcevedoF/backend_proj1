import type { ArticleProps } from '@/features/article/domain/Article';
import type { HydratedDocument } from 'mongoose';
import type { ArticleDocument } from './schema';

/**
 * Converts a Mongoose document to domain ArticleProps
 */
export function toDomain(doc: HydratedDocument<ArticleDocument>): ArticleProps {
  return {
    id: doc._id,
    workspaceId: doc.workspaceId,
    title: doc.title,
    content: doc.content,
    tags: doc.tags ?? [],
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
    title: props.title,
    content: props.content,
    tags: props.tags,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
  };
}
