import { z } from 'zod';

// ========== Enums as Zod schemas ==========

const ResourceTypeSchema = z.enum(['article', 'video', 'book', 'course', 'paper', 'exercise']);
const ResourceStatusSchema = z.enum(['draft', 'external_raw', 'enriched', 'published']);
const ResourceSourceSchema = z.enum([
  'user',
  'semantic-scholar',
  'arxiv',
  'pubmed',
  'youtube',
  'coursera',
  'udemy',
]);
const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

// ========== Metadata Schemas ==========

const ArticleMetadataSchema = z.object({
  content: z.string().min(1, 'content is required'),
  authors: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().optional(),
  summary: z.string().optional(),
  aiCategories: z.array(z.string()).optional(),
});

const VideoMetadataSchema = z.object({
  duration: z.number().positive('duration must be positive'),
  platform: z.string().min(1, 'platform is required'),
  channelName: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const BookMetadataSchema = z.object({
  authors: z.array(z.string()).min(1, 'at least one author is required'),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publishedYear: z.number().int().min(1000).max(2100).optional(),
  pages: z.number().int().positive().optional(),
  chapters: z.array(z.string()).optional(),
});

const CourseMetadataSchema = z.object({
  platform: z.string().min(1, 'platform is required'),
  instructor: z.string().optional(),
  duration: z.number().positive('duration must be positive'),
  modules: z.array(z.string()).optional(),
  certificate: z.boolean().optional(),
});

const PaperMetadataSchema = z.object({
  authors: z.array(z.string()).min(1, 'at least one author is required'),
  abstract: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
  journal: z.string().optional(),
  doi: z.string().optional(),
  citations: z.number().int().nonnegative().optional(),
});

const ExerciseMetadataSchema = z.object({
  estimatedTime: z.number().positive('estimatedTime must be positive'),
  solution: z.string().optional(),
  hints: z.array(z.string()).optional(),
});

// ========== Base Resource Schema ==========

const BaseCreateResourceSchema = z.object({
  title: z.string().min(1, 'title is required').max(500),
  description: z.string().max(5000).optional(),
  url: z.string().url('invalid URL format').optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  categoryIds: z.array(z.string()).optional(),
  status: ResourceStatusSchema.optional(),
  source: ResourceSourceSchema.optional(),
  externalId: z.string().optional(),
  difficulty: DifficultyLevelSchema.optional(),
  estimatedDuration: z.number().positive().optional(),
});

// ========== Create Resource Schemas (discriminated union) ==========

const CreateArticleResourceSchema = BaseCreateResourceSchema.extend({
  type: z.literal('article'),
  metadata: ArticleMetadataSchema,
});

const CreateVideoResourceSchema = BaseCreateResourceSchema.extend({
  type: z.literal('video'),
  metadata: VideoMetadataSchema,
});

const CreateBookResourceSchema = BaseCreateResourceSchema.extend({
  type: z.literal('book'),
  metadata: BookMetadataSchema,
});

const CreateCourseResourceSchema = BaseCreateResourceSchema.extend({
  type: z.literal('course'),
  metadata: CourseMetadataSchema,
});

const CreatePaperResourceSchema = BaseCreateResourceSchema.extend({
  type: z.literal('paper'),
  metadata: PaperMetadataSchema,
});

const CreateExerciseResourceSchema = BaseCreateResourceSchema.extend({
  type: z.literal('exercise'),
  metadata: ExerciseMetadataSchema,
});

export const CreateResourceSchema = z.discriminatedUnion('type', [
  CreateArticleResourceSchema,
  CreateVideoResourceSchema,
  CreateBookResourceSchema,
  CreateCourseResourceSchema,
  CreatePaperResourceSchema,
  CreateExerciseResourceSchema,
]);

// ========== Update Resource Schema ==========

export const UpdateResourceSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  url: z.string().url('invalid URL format').optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  categoryIds: z.array(z.string()).optional(),
  status: ResourceStatusSchema.optional(),
  difficulty: DifficultyLevelSchema.optional(),
  estimatedDuration: z.number().positive().optional(),
  metadata: z
    .union([
      ArticleMetadataSchema.partial(),
      VideoMetadataSchema.partial(),
      BookMetadataSchema.partial(),
      CourseMetadataSchema.partial(),
      PaperMetadataSchema.partial(),
      ExerciseMetadataSchema.partial(),
    ])
    .optional(),
});

// ========== Query Resources Schema ==========

export const QueryResourcesSchema = z.object({
  workspaceId: z.string().optional(),
  userId: z.string().optional(),
  type: ResourceTypeSchema.optional(),
  types: z
    .string()
    .transform((val) => val.split(','))
    .pipe(z.array(ResourceTypeSchema))
    .optional(),
  status: ResourceStatusSchema.optional(),
  source: ResourceSourceSchema.optional(),
  categoryIds: z
    .string()
    .transform((val) => val.split(','))
    .optional(),
  tags: z
    .string()
    .transform((val) => val.split(','))
    .optional(),
  search: z.string().max(200).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional(),
  sortField: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ========== Bulk Insert Schema ==========

export const BulkInsertResourcesSchema = z.object({
  resources: z.array(CreateResourceSchema).min(1).max(100),
});

// ========== Type exports ==========

export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
export type QueryResourcesInput = z.infer<typeof QueryResourcesSchema>;
export type BulkInsertResourcesInput = z.infer<typeof BulkInsertResourcesSchema>;
