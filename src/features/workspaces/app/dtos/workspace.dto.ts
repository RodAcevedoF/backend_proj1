/**
 * Create Workspace DTO
 * Input for creating a new workspace
 */
export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

/**
 * Update Workspace DTO
 * Input for updating workspace information
 */
export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

/**
 * Invite Member DTO
 * Input for inviting a user to workspace
 */
export interface InviteMemberDto {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

/**
 * Change Member Role DTO
 * Input for changing member's role
 */
export interface ChangeMemberRoleDto {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
}

/**
 * Transfer Ownership DTO
 * Input for transferring workspace ownership
 */
export interface TransferOwnershipDto {
  newOwnerId: string;
}

/**
 * Update Workspace Settings DTO
 * Input for updating workspace settings
 */
export interface UpdateWorkspaceSettingsDto {
  allowPublicAccess?: boolean;
  defaultArticleVisibility?: 'private' | 'workspace' | 'public';
  enableAIEnrichment?: boolean;
  maxMembersPerWorkspace?: number;
}

/**
 * Workspace Member Response DTO
 */
export interface WorkspaceMemberResponseDto {
  userId: string;
  role: string;
  joinedAt: Date;
  invitedBy?: string;
  canEdit: boolean;
  canManage: boolean;
  isOwner: boolean;
}

/**
 * Workspace Response DTO
 * Output for workspace data
 */
export interface WorkspaceResponseDto {
  id: string;
  name: string;
  description?: string;
  members: WorkspaceMemberResponseDto[];
  settings: {
    allowPublicAccess: boolean;
    defaultArticleVisibility: 'private' | 'workspace' | 'public';
    enableAIEnrichment: boolean;
    maxMembersPerWorkspace?: number;
  };
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}
