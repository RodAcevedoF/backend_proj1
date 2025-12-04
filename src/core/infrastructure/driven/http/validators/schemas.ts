import { z } from 'zod';

/**
 * Validation Schemas
 * Using Zod for runtime type validation
 */

// User Schemas
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  workspaceName: z.string().min(1).max(100).optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url('Invalid URL format').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(100, 'Workspace name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100, 'Workspace name must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: 'Role must be admin, editor, or viewer',
  }),
});

export const changeMemberRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: 'Role must be admin, editor, or viewer',
  }),
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().uuid('Invalid user ID format'),
});

export const updateWorkspaceSettingsSchema = z.object({
  allowPublicAccess: z.boolean().optional(),
  defaultArticleVisibility: z
    .enum(['private', 'workspace', 'public'])
    .optional(),
  enableAIEnrichment: z.boolean().optional(),
  maxMembersPerWorkspace: z.number().int().positive().optional(),
});
