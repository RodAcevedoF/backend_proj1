/**
 * Resource Types
 */
export type ResourceType =
  | 'article'
  | 'video'
  | 'book'
  | 'course'
  | 'paper'
  | 'exercise';

export type ResourceStatus = 'draft' | 'external_raw' | 'enriched' | 'published';
export type ResourceSource =
  | 'user'
  | 'semantic-scholar'
  | 'arxiv'
  | 'pubmed'
  | 'youtube'
  | 'coursera'
  | 'udemy';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Type-specific metadata interfaces
 */
export interface ArticleMetadata {
  content: string;
  authors: string[];
  publishedAt?: Date;
  summary?: string;
  aiCategories?: string[];
}

export interface VideoMetadata {
  duration: number; // in minutes
  platform: string; // youtube, vimeo, etc.
  channelName?: string;
  thumbnailUrl?: string;
}

export interface BookMetadata {
  authors: string[];
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  chapters?: string[];
}

export interface CourseMetadata {
  platform: string; // coursera, udemy, etc.
  instructor?: string;
  duration: number; // in hours
  modules?: string[];
  certificate?: boolean;
}

export interface PaperMetadata {
  authors: string[];
  abstract?: string;
  publishedAt?: Date;
  journal?: string;
  doi?: string;
  citations?: number;
}

export interface ExerciseMetadata {
  estimatedTime: number; // in minutes
  solution?: string;
  hints?: string[];
}

/**
 * Metadata union type
 */
export type ResourceMetadata =
  | ArticleMetadata
  | VideoMetadata
  | BookMetadata
  | CourseMetadata
  | PaperMetadata
  | ExerciseMetadata;

/**
 * Base resource properties (common to all types)
 */
export interface BaseResourceProps {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  description?: string;
  url?: string;
  tags: string[];
  categoryIds: string[];
  status: ResourceStatus;
  source: ResourceSource;
  externalId?: string;
  difficulty?: DifficultyLevel;
  estimatedDuration?: number; // in minutes (normalized)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Discriminated union for Resource
 */
export type ResourceProps =
  | (BaseResourceProps & { type: 'article'; metadata: ArticleMetadata })
  | (BaseResourceProps & { type: 'video'; metadata: VideoMetadata })
  | (BaseResourceProps & { type: 'book'; metadata: BookMetadata })
  | (BaseResourceProps & { type: 'course'; metadata: CourseMetadata })
  | (BaseResourceProps & { type: 'paper'; metadata: PaperMetadata })
  | (BaseResourceProps & { type: 'exercise'; metadata: ExerciseMetadata });

/**
 * Resource Entity
 */
export class Resource {
  private constructor(private readonly props: ResourceProps) {}

  static create(props: ResourceProps): Resource {
    return new Resource(props);
  }

  // Base getters
  get id(): string {
    return this.props.id;
  }

  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): ResourceType {
    return this.props.type;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get url(): string | undefined {
    return this.props.url;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get categoryIds(): string[] {
    return [...this.props.categoryIds];
  }

  get status(): ResourceStatus {
    return this.props.status;
  }

  get source(): ResourceSource {
    return this.props.source;
  }

  get externalId(): string | undefined {
    return this.props.externalId;
  }

  get difficulty(): DifficultyLevel | undefined {
    return this.props.difficulty;
  }

  get estimatedDuration(): number | undefined {
    return this.props.estimatedDuration;
  }

  get metadata(): ResourceMetadata {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Type guards
  isArticle(): this is Resource & { props: { type: 'article'; metadata: ArticleMetadata } } {
    return this.props.type === 'article';
  }

  isVideo(): this is Resource & { props: { type: 'video'; metadata: VideoMetadata } } {
    return this.props.type === 'video';
  }

  isBook(): this is Resource & { props: { type: 'book'; metadata: BookMetadata } } {
    return this.props.type === 'book';
  }

  isCourse(): this is Resource & { props: { type: 'course'; metadata: CourseMetadata } } {
    return this.props.type === 'course';
  }

  isPaper(): this is Resource & { props: { type: 'paper'; metadata: PaperMetadata } } {
    return this.props.type === 'paper';
  }

  isExercise(): this is Resource & { props: { type: 'exercise'; metadata: ExerciseMetadata } } {
    return this.props.type === 'exercise';
  }

  // Status checks
  isEnriched(): boolean {
    return this.props.status === 'enriched';
  }

  isExternal(): boolean {
    return this.props.status === 'external_raw';
  }

  isPublished(): boolean {
    return this.props.status === 'published';
  }

  // Conversion
  toPrimitives(): ResourceProps {
    return { ...this.props };
  }
}
