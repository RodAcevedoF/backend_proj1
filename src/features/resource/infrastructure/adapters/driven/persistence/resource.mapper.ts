import {
  Resource,
  ResourceProps,
  ResourceType,
  ResourceStatus,
  ResourceSource,
  DifficultyLevel,
  ArticleMetadata,
  VideoMetadata,
  BookMetadata,
  CourseMetadata,
  PaperMetadata,
  ExerciseMetadata,
} from '@/features/resource/domain/Resource';

interface ResourceDocument {
  _id: string;
  workspaceId: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  tags: string[];
  categoryIds: string[];
  status: string;
  source: string;
  externalId?: string;
  difficulty?: string;
  estimatedDuration?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceMapper {
  static toDomain(doc: ResourceDocument): Resource {
    const type = doc.type as ResourceType;
    const baseProps = {
      id: doc._id,
      workspaceId: doc.workspaceId,
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      url: doc.url,
      tags: doc.tags ?? [],
      categoryIds: doc.categoryIds ?? [],
      status: doc.status as ResourceStatus,
      source: doc.source as ResourceSource,
      externalId: doc.externalId,
      difficulty: doc.difficulty as DifficultyLevel | undefined,
      estimatedDuration: doc.estimatedDuration,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    let props: ResourceProps;

    switch (type) {
      case 'article':
        props = {
          ...baseProps,
          type: 'article',
          metadata: doc.metadata as unknown as ArticleMetadata,
        };
        break;
      case 'video':
        props = {
          ...baseProps,
          type: 'video',
          metadata: doc.metadata as unknown as VideoMetadata,
        };
        break;
      case 'book':
        props = {
          ...baseProps,
          type: 'book',
          metadata: doc.metadata as unknown as BookMetadata,
        };
        break;
      case 'course':
        props = {
          ...baseProps,
          type: 'course',
          metadata: doc.metadata as unknown as CourseMetadata,
        };
        break;
      case 'paper':
        props = {
          ...baseProps,
          type: 'paper',
          metadata: doc.metadata as unknown as PaperMetadata,
        };
        break;
      case 'exercise':
        props = {
          ...baseProps,
          type: 'exercise',
          metadata: doc.metadata as unknown as ExerciseMetadata,
        };
        break;
      default:
        throw new Error(`Unknown resource type: ${type}`);
    }

    return Resource.create(props);
  }

  static toPersistence(resource: Resource): Record<string, unknown> {
    const props = resource.toPrimitives();
    return {
      _id: props.id,
      workspaceId: props.workspaceId,
      userId: props.userId,
      type: props.type,
      title: props.title,
      description: props.description,
      url: props.url,
      tags: props.tags,
      categoryIds: props.categoryIds,
      status: props.status,
      source: props.source,
      externalId: props.externalId,
      difficulty: props.difficulty,
      estimatedDuration: props.estimatedDuration,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
