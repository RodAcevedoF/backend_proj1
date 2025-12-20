import { randomUUID } from 'crypto';
import {
  Resource,
  ResourceProps,
  ResourceStatus,
  ResourceSource,
  DifficultyLevel,
  ArticleMetadata,
  VideoMetadata,
  BookMetadata,
  CourseMetadata,
  PaperMetadata,
  ExerciseMetadata,
} from './Resource';

interface BaseCreateInput {
  id?: string;
  workspaceId: string;
  userId: string;
  title: string;
  description?: string;
  url?: string;
  tags?: string[];
  categoryIds?: string[];
  status?: ResourceStatus;
  source?: ResourceSource;
  externalId?: string;
  difficulty?: DifficultyLevel;
  estimatedDuration?: number;
}

export interface CreateArticleInput extends BaseCreateInput {
  metadata: Omit<ArticleMetadata, 'aiCategories'> & { aiCategories?: string[] };
}

export interface CreateVideoInput extends BaseCreateInput {
  metadata: VideoMetadata;
}

export interface CreateBookInput extends BaseCreateInput {
  metadata: BookMetadata;
}

export interface CreateCourseInput extends BaseCreateInput {
  metadata: CourseMetadata;
}

export interface CreatePaperInput extends BaseCreateInput {
  metadata: PaperMetadata;
}

export interface CreateExerciseInput extends BaseCreateInput {
  metadata: ExerciseMetadata;
}

export class ResourceFactory {
  private static buildBaseProps(input: BaseCreateInput): Omit<ResourceProps, 'type' | 'metadata'> {
    const now = new Date();
    return {
      id: input.id ?? randomUUID(),
      workspaceId: input.workspaceId,
      userId: input.userId,
      title: input.title,
      description: input.description,
      url: input.url,
      tags: input.tags ?? [],
      categoryIds: input.categoryIds ?? [],
      status: input.status ?? 'draft',
      source: input.source ?? 'user',
      externalId: input.externalId,
      difficulty: input.difficulty,
      estimatedDuration: input.estimatedDuration,
      createdAt: now,
      updatedAt: now,
    };
  }

  static createArticle(input: CreateArticleInput): Resource {
    const props: ResourceProps = {
      ...this.buildBaseProps(input),
      type: 'article',
      metadata: {
        content: input.metadata.content,
        authors: input.metadata.authors,
        publishedAt: input.metadata.publishedAt,
        summary: input.metadata.summary,
        aiCategories: input.metadata.aiCategories ?? [],
      },
    };
    return Resource.create(props);
  }

  static createVideo(input: CreateVideoInput): Resource {
    const props: ResourceProps = {
      ...this.buildBaseProps(input),
      type: 'video',
      metadata: input.metadata,
    };
    return Resource.create(props);
  }

  static createBook(input: CreateBookInput): Resource {
    const props: ResourceProps = {
      ...this.buildBaseProps(input),
      type: 'book',
      metadata: input.metadata,
    };
    return Resource.create(props);
  }

  static createCourse(input: CreateCourseInput): Resource {
    const props: ResourceProps = {
      ...this.buildBaseProps(input),
      type: 'course',
      metadata: input.metadata,
    };
    return Resource.create(props);
  }

  static createPaper(input: CreatePaperInput): Resource {
    const props: ResourceProps = {
      ...this.buildBaseProps(input),
      type: 'paper',
      metadata: input.metadata,
    };
    return Resource.create(props);
  }

  static createExercise(input: CreateExerciseInput): Resource {
    const props: ResourceProps = {
      ...this.buildBaseProps(input),
      type: 'exercise',
      metadata: input.metadata,
    };
    return Resource.create(props);
  }
}
