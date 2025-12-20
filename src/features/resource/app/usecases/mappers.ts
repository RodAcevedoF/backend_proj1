import { Resource } from '@/features/resource/domain/Resource';
import { ResourceResponseDTO } from '../dtos/resource.dto';

export function resourceToResponseDTO(resource: Resource): ResourceResponseDTO {
  const props = resource.toPrimitives();

  const base = {
    id: props.id,
    workspaceId: props.workspaceId,
    userId: props.userId,
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
    createdAt: props.createdAt.toISOString(),
    updatedAt: props.updatedAt.toISOString(),
  };

  switch (props.type) {
    case 'article': {
      const { publishedAt, ...restMeta } = props.metadata;
      return {
        ...base,
        type: 'article',
        metadata: {
          ...restMeta,
          publishedAt: publishedAt?.toISOString(),
        },
      };
    }
    case 'paper': {
      const { publishedAt, ...restMeta } = props.metadata;
      return {
        ...base,
        type: 'paper',
        metadata: {
          ...restMeta,
          publishedAt: publishedAt?.toISOString(),
        },
      };
    }
    case 'video':
      return {
        ...base,
        type: 'video',
        metadata: props.metadata,
      };
    case 'book':
      return {
        ...base,
        type: 'book',
        metadata: props.metadata,
      };
    case 'course':
      return {
        ...base,
        type: 'course',
        metadata: props.metadata,
      };
    case 'exercise':
      return {
        ...base,
        type: 'exercise',
        metadata: props.metadata,
      };
  }
}
