import { Schema, model } from 'mongoose';

// Embedded Member Schema
const MemberSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      required: true,
    },
    joinedAt: { type: Date, required: true },
    invitedBy: { type: String },
  },
  { _id: false }
);

// Embedded Settings Schema
const SettingsSchema = new Schema(
  {
    allowPublicAccess: { type: Boolean, default: false },
    defaultArticleVisibility: {
      type: String,
      enum: ['private', 'workspace', 'public'],
      default: 'workspace',
    },
    enableAIEnrichment: { type: Boolean, default: true },
    maxMembersPerWorkspace: { type: Number },
  },
  { _id: false }
);

// Main Workspace Schema
const WorkspaceSchema = new Schema(
  {
    _id: { type: String, required: true }, // UUID from EntityId
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    ownerId: { type: String, required: true, index: true }, // Denormalized for unique constraint
    members: { type: [MemberSchema], default: [] },
    settings: { type: SettingsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    collection: 'workspaces',
  }
);

// Indexes
WorkspaceSchema.index({ 'members.userId': 1 });
WorkspaceSchema.index({ ownerId: 1, name: 1 }, { unique: true }); // Unique name per owner
WorkspaceSchema.index({ createdAt: -1 });

// Prevent Mongoose from creating _id
WorkspaceSchema.set('_id', false);

export const WorkspaceModel = model('Workspace', WorkspaceSchema);
