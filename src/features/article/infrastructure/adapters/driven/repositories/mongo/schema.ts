import { Schema, model, type InferSchemaType } from 'mongoose';

const ArticleSchema = new Schema(
  {
    _id: { type: String, required: true }, // UUID from domain
    workspaceId: { type: String, required: false, index: true },
    userId: { type: String, required: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    categoryIds: { type: [String], default: [], index: true }, // References Category

    // Metadata
    status: {
      type: String,
      enum: ['external_raw', 'enriched', 'user_created'],
      default: 'user_created',
      index: true,
    },
    source: {
      type: String,
      enum: ['semantic-scholar', 'user', 'arxiv', 'pubmed'],
      default: 'user',
    },
    externalId: { type: String, required: false, index: true },

    // AI-enriched fields
    summary: { type: String, required: false },
    aiCategories: { type: [String], default: [] },

    // External article metadata
    url: { type: String, required: false },
    authors: { type: [String], default: [] },
    publishedAt: { type: Date, required: false },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
  }
);

// Indexes
ArticleSchema.index({ workspaceId: 1, status: 1 });
ArticleSchema.index({ workspaceId: 1, createdAt: -1 });
ArticleSchema.index({ userId: 1 });
ArticleSchema.index({ source: 1, externalId: 1 }, { sparse: true });
ArticleSchema.index({ title: 'text', content: 'text' }); // Text search

// Tipo del documento (opcional, para tipar internamente)
export type ArticleDocument = InferSchemaType<typeof ArticleSchema>;

// Model exportado
export const ArticleModel = model('Article', ArticleSchema);
