import { Schema, model } from 'mongoose';

const CategorySchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String }, // Hex color e.g. "#FF5733"
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'categories',
  }
);

// Indexes
CategorySchema.index({ workspaceId: 1, name: 1 }, { unique: true }); // Unique name per workspace
CategorySchema.index({ workspaceId: 1, createdAt: -1 });

export const CategoryModel = model('Category', CategorySchema);
