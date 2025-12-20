import {
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

// ========== Create DTOs ==========

interface BaseCreateResourceDTO {
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

export interface CreateArticleResourceDTO extends BaseCreateResourceDTO {
  type: 'article';
  metadata: ArticleMetadata;
}

export interface CreateVideoResourceDTO extends BaseCreateResourceDTO {
  type: 'video';
  metadata: VideoMetadata;
}

export interface CreateBookResourceDTO extends BaseCreateResourceDTO {
  type: 'book';
  metadata: BookMetadata;
}

export interface CreateCourseResourceDTO extends BaseCreateResourceDTO {
  type: 'course';
  metadata: CourseMetadata;
}

export interface CreatePaperResourceDTO extends BaseCreateResourceDTO {
  type: 'paper';
  metadata: PaperMetadata;
}

export interface CreateExerciseResourceDTO extends BaseCreateResourceDTO {
  type: 'exercise';
  metadata: ExerciseMetadata;
}

export type CreateResourceDTO =
  | CreateArticleResourceDTO
  | CreateVideoResourceDTO
  | CreateBookResourceDTO
  | CreateCourseResourceDTO
  | CreatePaperResourceDTO
  | CreateExerciseResourceDTO;

// ========== Update DTOs ==========

export interface UpdateResourceDTO {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  tags?: string[];
  categoryIds?: string[];
  status?: ResourceStatus;
  difficulty?: DifficultyLevel;
  estimatedDuration?: number;
  metadata?: Partial<ArticleMetadata | VideoMetadata | BookMetadata | CourseMetadata | PaperMetadata | ExerciseMetadata>;
}

// ========== Query DTOs ==========

export interface GetResourceDTO {
  id: string;
}

export interface GetResourcesByIdsDTO {
  ids: string[];
}

export interface FindByWorkspaceDTO {
  workspaceId: string;
}

export interface FindResourcesDTO {
  workspaceId?: string;
  userId?: string;
  type?: ResourceType;
  types?: ResourceType[];
  status?: ResourceStatus;
  source?: ResourceSource;
  categoryIds?: string[];
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortField?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface DeleteResourceDTO {
  id: string;
}

export interface BulkInsertResourcesDTO {
  resources: CreateResourceDTO[];
}

// ========== Response DTOs ==========

interface BaseResourceResponseDTO {
  id: string;
  workspaceId: string;
  userId: string;
  type: ResourceType;
  title: string;
  description?: string;
  url?: string;
  tags: string[];
  categoryIds: string[];
  status: ResourceStatus;
  source: ResourceSource;
  externalId?: string;
  difficulty?: DifficultyLevel;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleResourceResponseDTO extends BaseResourceResponseDTO {
  type: 'article';
  metadata: Omit<ArticleMetadata, 'publishedAt'> & { publishedAt?: string };
}

export interface VideoResourceResponseDTO extends BaseResourceResponseDTO {
  type: 'video';
  metadata: VideoMetadata;
}

export interface BookResourceResponseDTO extends BaseResourceResponseDTO {
  type: 'book';
  metadata: BookMetadata;
}

export interface CourseResourceResponseDTO extends BaseResourceResponseDTO {
  type: 'course';
  metadata: CourseMetadata;
}

export interface PaperResourceResponseDTO extends BaseResourceResponseDTO {
  type: 'paper';
  metadata: Omit<PaperMetadata, 'publishedAt'> & { publishedAt?: string };
}

export interface ExerciseResourceResponseDTO extends BaseResourceResponseDTO {
  type: 'exercise';
  metadata: ExerciseMetadata;
}

export type ResourceResponseDTO =
  | ArticleResourceResponseDTO
  | VideoResourceResponseDTO
  | BookResourceResponseDTO
  | CourseResourceResponseDTO
  | PaperResourceResponseDTO
  | ExerciseResourceResponseDTO;

export interface PaginatedResourcesResponseDTO {
  data: ResourceResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
