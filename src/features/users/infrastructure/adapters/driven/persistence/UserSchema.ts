import { Schema, model } from 'mongoose';

// Embedded Profile Schema
const ProfileSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    avatarUrl: { type: String },
    bio: { type: String },
  },
  { _id: false }
);

// Embedded Workspace Membership Schema
const WorkspaceMembershipSchema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      required: true,
    },
    joinedAt: { type: Date, required: true },
    membershipStart: { type: Date },
    membershipEnd: { type: Date },
  },
  { _id: false }
);

// Main User Schema
const UserSchema = new Schema(
  {
    _id: { type: String, required: true }, // UUID from EntityId
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String },
    profile: { type: ProfileSchema, default: () => ({}) },
    workspaces: { type: [WorkspaceMembershipSchema], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    // Auth provider fields
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
      required: true,
    },
    oauthId: { type: String, sparse: true, index: true },
    // Email verification fields
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    // Password reset fields
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes
UserSchema.index({ 'workspaces.workspaceId': 1 });
UserSchema.index({ email: 1 }, { unique: true });

// Prevent Mongoose from creating _id
UserSchema.set('_id', false);

export const UserModel = model('User', UserSchema);
