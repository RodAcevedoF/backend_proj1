import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { EntityId } from '../../../core/domain/EntityId';
import { WorkspaceMember, WorkspaceMemberRole } from './WorkspaceMember';
import { WorkspaceSettings } from './WorkspaceSettings';
import {
  WorkspaceCreatedEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  MemberRoleChangedEvent,
  WorkspaceUpdatedEvent,
  WorkspaceSettingsUpdatedEvent,
  OwnershipTransferredEvent,
} from './WorkspaceEvents';

export interface WorkspaceProps {
  name: string;
  description?: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workspace Aggregate Root
 * Manages workspace information, members, and settings
 */
export class Workspace extends AggregateRoot {
  private props: WorkspaceProps;

  private constructor(id: EntityId, props: WorkspaceProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new workspace
   */
  static create(
    name: string,
    ownerId: EntityId,
    description?: string
  ): Workspace {
    const workspaceId = EntityId.create();
    const now = new Date();

    const owner = WorkspaceMember.create(ownerId, 'owner');

    const workspace = new Workspace(workspaceId, {
      name,
      description,
      members: [owner],
      settings: WorkspaceSettings.createDefault(),
      createdAt: now,
      updatedAt: now,
    });

    workspace.addDomainEvent(
      new WorkspaceCreatedEvent(workspaceId, name, ownerId)
    );

    return workspace;
  }

  /**
   * Reconstitute workspace from persistence
   */
  static from(id: EntityId, props: WorkspaceProps): Workspace {
    return new Workspace(id, props);
  }

  // Getters
  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get members(): ReadonlyArray<WorkspaceMember> {
    return this.props.members;
  }

  get settings(): WorkspaceSettings {
    return this.props.settings;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic

  /**
   * Update workspace information
   */
  update(updates: { name?: string; description?: string }): void {
    const updatedFields: string[] = [];

    if (updates.name !== undefined) {
      this.props.name = updates.name;
      updatedFields.push('name');
    }

    if (updates.description !== undefined) {
      this.props.description = updates.description;
      updatedFields.push('description');
    }

    if (updatedFields.length > 0) {
      this.props.updatedAt = new Date();
      this.addDomainEvent(new WorkspaceUpdatedEvent(this.id, updatedFields));
    }
  }

  /**
   * Update workspace settings
   */
  updateSettings(
    updates: Partial<{
      allowPublicAccess: boolean;
      defaultArticleVisibility: 'private' | 'workspace' | 'public';
      enableAIEnrichment: boolean;
      maxMembersPerWorkspace?: number;
    }>,
    updatedBy: EntityId
  ): void {
    this.props.settings = this.props.settings.update(updates);
    this.props.updatedAt = new Date();
    this.addDomainEvent(new WorkspaceSettingsUpdatedEvent(this.id, updatedBy));
  }

  /**
   * Add a member to the workspace
   */
  addMember(
    userId: EntityId,
    role: WorkspaceMemberRole,
    invitedBy?: EntityId
  ): void {
    // Check if already a member
    if (this.isMember(userId)) {
      throw new Error('User is already a member of this workspace');
    }

    // Check member limit
    if (this.props.settings.maxMembersPerWorkspace) {
      if (
        this.props.members.length >= this.props.settings.maxMembersPerWorkspace
      ) {
        throw new Error('Workspace has reached maximum member capacity');
      }
    }

    const member = WorkspaceMember.create(userId, role, invitedBy);
    this.props.members = [...this.props.members, member];
    this.props.updatedAt = new Date();

    this.addDomainEvent(new MemberAddedEvent(this.id, userId, role, invitedBy));
  }

  /**
   * Remove a member from the workspace
   */
  removeMember(userId: EntityId, removedBy?: EntityId): void {
    const index = this.props.members.findIndex((m) => m.userId.equals(userId));

    if (index === -1) {
      throw new Error('User is not a member of this workspace');
    }

    // Prevent removing the owner
    if (this.props.members[index].isOwner()) {
      throw new Error(
        'Cannot remove workspace owner. Transfer ownership first.'
      );
    }

    this.props.members = this.props.members.filter(
      (m) => !m.userId.equals(userId)
    );
    this.props.updatedAt = new Date();

    this.addDomainEvent(new MemberRemovedEvent(this.id, userId, removedBy));
  }

  /**
   * Change a member's role
   */
  changeMemberRole(
    userId: EntityId,
    newRole: WorkspaceMemberRole,
    changedBy?: EntityId
  ): void {
    const index = this.props.members.findIndex((m) => m.userId.equals(userId));

    if (index === -1) {
      throw new Error('User is not a member of this workspace');
    }

    // Prevent changing owner role directly (use transferOwnership instead)
    if (this.props.members[index].isOwner() || newRole === 'owner') {
      throw new Error('Use transferOwnership to change workspace ownership');
    }

    const oldRole = this.props.members[index].role;
    this.props.members = [
      ...this.props.members.slice(0, index),
      this.props.members[index].withRole(newRole),
      ...this.props.members.slice(index + 1),
    ];
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new MemberRoleChangedEvent(this.id, userId, oldRole, newRole, changedBy)
    );
  }

  /**
   * Transfer workspace ownership
   */
  transferOwnership(newOwnerId: EntityId): void {
    const currentOwnerIndex = this.props.members.findIndex((m) => m.isOwner());
    const newOwnerIndex = this.props.members.findIndex((m) =>
      m.userId.equals(newOwnerId)
    );

    if (currentOwnerIndex === -1) {
      throw new Error('No current owner found');
    }

    if (newOwnerIndex === -1) {
      throw new Error('New owner is not a member of this workspace');
    }

    const currentOwnerId = this.props.members[currentOwnerIndex].userId;

    // Demote current owner to admin
    const demotedOwner =
      this.props.members[currentOwnerIndex].withRole('admin');
    // Promote new owner
    const promotedOwner = this.props.members[newOwnerIndex].withRole('owner');

    this.props.members = [
      ...this.props.members.slice(0, currentOwnerIndex),
      demotedOwner,
      ...this.props.members.slice(currentOwnerIndex + 1, newOwnerIndex),
      promotedOwner,
      ...this.props.members.slice(newOwnerIndex + 1),
    ];
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new OwnershipTransferredEvent(this.id, currentOwnerId, newOwnerId)
    );
  }

  /**
   * Get member by user ID
   */
  getMember(userId: EntityId): WorkspaceMember | undefined {
    return this.props.members.find((m) => m.userId.equals(userId));
  }

  /**
   * Check if user is a member
   */
  isMember(userId: EntityId): boolean {
    return this.props.members.some((m) => m.userId.equals(userId));
  }

  /**
   * Check if user is the owner
   */
  isOwner(userId: EntityId): boolean {
    const member = this.getMember(userId);
    return member ? member.isOwner() : false;
  }

  /**
   * Check if user can edit resources
   */
  canEdit(userId: EntityId): boolean {
    const member = this.getMember(userId);
    return member ? member.canEdit() : false;
  }

  /**
   * Check if user can manage workspace
   */
  canManage(userId: EntityId): boolean {
    const member = this.getMember(userId);
    return member ? member.canManage() : false;
  }

  /**
   * Get workspace owner
   */
  getOwner(): WorkspaceMember | undefined {
    return this.props.members.find((m) => m.isOwner());
  }

  /**
   * Get all admins (including owner)
   */
  getAdmins(): WorkspaceMember[] {
    return this.props.members.filter((m) => m.canManage());
  }

  /**
   * Get member count
   */
  getMemberCount(): number {
    return this.props.members.length;
  }

  /**
   * Convert to primitives for persistence
   */
  toPrimitives() {
    return {
      id: this.id.toString(),
      name: this.props.name,
      description: this.props.description,
      members: this.props.members.map((m) => m.toPrimitives()),
      settings: this.props.settings.toPrimitives(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
