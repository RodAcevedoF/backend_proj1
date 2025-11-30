import { Schema, model, type InferSchemaType } from 'mongoose';

const ArticleSchema = new Schema(
  {
    _id: { type: String, required: true }, // UUID from domain
    workspaceId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
  }
);

// Tipo del documento (opcional, para tipar internamente)
export type ArticleDocument = InferSchemaType<typeof ArticleSchema>;

// Model exportado
export const ArticleModel = model('Article', ArticleSchema);
