/**
 * Workspace Role
 * Defines permission levels within a workspace
 *
 * Hierarchy (highest to lowest):
 * - owner: Full control, can delete workspace, transfer ownership
 * - admin: Can manage members, settings, all content
 * - editor: Can create/edit content
 * - viewer: Read-only access
 */
export type Role = 'owner' | 'admin' | 'editor' | 'viewer';

export const Roles = {
  OWNER: 'owner' as Role,
  ADMIN: 'admin' as Role,
  EDITOR: 'editor' as Role,
  VIEWER: 'viewer' as Role,
} as const;

/**
 * Role hierarchy for permission checks
 * Higher number = more permissions
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Check if a role has at least the required permission level
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if role can edit (owner, admin, editor)
 */
export function canEdit(role: Role): boolean {
  return hasMinimumRole(role, 'editor');
}

/**
 * Check if role can manage (owner, admin)
 */
export function canManage(role: Role): boolean {
  return hasMinimumRole(role, 'admin');
}

/**
 * Check if role is owner
 */
export function isOwner(role: Role): boolean {
  return role === 'owner';
}
