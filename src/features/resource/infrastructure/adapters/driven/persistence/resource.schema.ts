import { Schema, model, type InferSchemaType } from 'mongoose';

/**
 * Type-specific metadata schemas
 */
const ArticleMetadataSchema = new Schema(
  {
    content: { type: String, required: true },
    authors: { type: [String], default: [] },
    publishedAt: { type: Date },
    summary: { type: String },
    aiCategories: { type: [String], default: [] },
  },
  { _id: false }
);

const VideoMetadataSchema = new Schema(
  {
    duration: { type: Number, required: true }, // in minutes
    platform: { type: String, required: true },
    channelName: { type: String },
    thumbnailUrl: { type: String },
  },
  { _id: false }
);

const BookMetadataSchema = new Schema(
  {
    authors: { type: [String], default: [] },
    isbn: { type: String },
    publisher: { type: String },
    publishedYear: { type: Number },
    pages: { type: Number },
    chapters: { type: [String], default: [] },
  },
  { _id: false }
);

const CourseMetadataSchema = new Schema(
  {
    platform: { type: String, required: true },
    instructor: { type: String },
    duration: { type: Number, required: true }, // in hours
    modules: { type: [String], default: [] },
    certificate: { type: Boolean, default: false },
  },
  { _id: false }
);

const PaperMetadataSchema = new Schema(
  {
    authors: { type: [String], default: [] },
    abstract: { type: String },
    publishedAt: { type: Date },
    journal: { type: String },
    doi: { type: String },
    citations: { type: Number },
  },
  { _id: false }
);

const ExerciseMetadataSchema = new Schema(
  {
    estimatedTime: { type: Number, required: true }, // in minutes
    solution: { type: String },
    hints: { type: [String], default: [] },
  },
  { _id: false }
);

/**
 * Main Resource Schema
 */
const ResourceSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['article', 'video', 'book', 'course', 'paper', 'exercise'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    tags: { type: [String], default: [] },
    categoryIds: { type: [String], default: [], index: true },
    status: {
      type: String,
      enum: ['draft', 'external_raw', 'enriched', 'published'],
      default: 'draft',
      index: true,
    },
    source: {
      type: String,
      enum: ['user', 'semantic-scholar', 'arxiv', 'pubmed', 'youtube', 'coursera', 'udemy'],
      default: 'user',
    },
    externalId: { type: String, index: true, sparse: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    estimatedDuration: { type: Number }, // in minutes (normalized)

    // Type-specific metadata (only one will be populated based on type)
    metadata: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
    collection: 'resources',
  }
);

// Compound indexes
ResourceSchema.index({ workspaceId: 1, type: 1 });
ResourceSchema.index({ workspaceId: 1, status: 1 });
ResourceSchema.index({ workspaceId: 1, createdAt: -1 });
ResourceSchema.index({ source: 1, externalId: 1 }, { sparse: true });
ResourceSchema.index({ title: 'text', description: 'text' }); // Text search

export type ResourceDocument = InferSchemaType<typeof ResourceSchema>;

export const ResourceModel = model('Resource', ResourceSchema);
