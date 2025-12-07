import { Schema, model } from 'mongoose';

/**
 * Roadmap Mongoose Schema
 */
const roadmapSchema = new Schema(
  {
    _id: { type: String, required: true },
    workspaceId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    steps: [
      {
        order: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        estimatedWeeks: { type: Number },
        resources: [
          {
            title: { type: String, required: true },
            type: {
              type: String,
              enum: ['video', 'article', 'book', 'exercise', 'course', 'paper'],
              required: true,
            },
            url: { type: String },
            description: { type: String },
            estimatedDuration: { type: Number },
            difficulty: {
              type: String,
              enum: ['beginner', 'intermediate', 'advanced'],
            },
          },
        ],
        prerequisites: [{ type: String }],
      },
    ],
    progress: [
      {
        userId: { type: String, required: true },
        stepOrder: { type: Number, required: true },
        completedAt: { type: Date },
        completedResources: [{ type: String }],
        notes: { type: String },
      },
    ],
    sourceArticleIds: [{ type: String }],
    generatedBy: { type: String, enum: ['ai', 'manual'], required: true },
    createdBy: { type: String, required: true, index: true },
    isPublished: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    collection: 'roadmaps',
  }
);

// Indexes
roadmapSchema.index({ workspaceId: 1, isPublished: 1 });
roadmapSchema.index({ createdBy: 1 });
roadmapSchema.index({ 'progress.userId': 1 });

export const RoadmapModel = model('Roadmap', roadmapSchema);
