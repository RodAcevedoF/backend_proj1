import mongoose, { InferSchemaType, Schema, model } from 'mongoose';

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    workspaceId: { type: String },
    userId: { type: String },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ArticleModel = model('Article', ArticleSchema);

export type ArticleDocument = InferSchemaType<typeof ArticleSchema>;
