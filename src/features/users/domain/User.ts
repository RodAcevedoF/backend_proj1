import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { EntityId } from '../../../core/domain/EntityId';
import { Email } from '../../../core/domain/Email';
import { WorkspaceMembership, Role } from './WorkspaceMembership';
import { UserProfile } from './UserProfile';
import {
  UserCreatedEvent,
  UserJoinedWorkspaceEvent,
  UserLeftWorkspaceEvent,
  UserRoleChangedEvent,
  UserProfileUpdatedEvent,
  UserPasswordChangedEvent,
} from './UserEvents';

export interface UserProps {
  email: Email;
  passwordHash: string;
  profile: UserProfile;
  workspaces: WorkspaceMembership[];
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Aggregate Root
 * Manages user authentication, profile, and workspace memberships
 */
export class User extends AggregateRoot {
  private props: UserProps;

  private constructor(id: EntityId, props: UserProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a new user
   */
  static create(
    email: Email,
    passwordHash: string,
    initialWorkspace?: { workspaceId: EntityId; role: Role }
  ): User {
    const userId = EntityId.create();
    const now = new Date();

    const workspaces: WorkspaceMembership[] = initialWorkspace
      ? [
          WorkspaceMembership.create(
            initialWorkspace.workspaceId,
            initialWorkspace.role,
            now
          ),
        ]
      : [];

    const user = new User(userId, {
      email,
      passwordHash,
      profile: UserProfile.create(),
      workspaces,
      isEmailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // Raise domain event
    user.addDomainEvent(
      new UserCreatedEvent(
        userId,
        email.toString(),
        initialWorkspace?.workspaceId || EntityId.create()
      )
    );

    return user;
  }

  /**
   * Reconstitute user from persistence
   */
  static from(id: EntityId, props: UserProps): User {
    return new User(id, props);
  }

  // Getters
  get email(): Email {
    return this.props.email;
  }

  get profile(): UserProfile {
    return this.props.profile;
  }

  get workspaces(): ReadonlyArray<WorkspaceMembership> {
    return this.props.workspaces;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic

  /**
   * Verify user's password
   */
  checkPassword(hash: string): boolean {
    return this.props.passwordHash === hash;
  }

  /**
   * Change user's password
   */
  changePassword(newPasswordHash: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }

  /**
   * Verify user's email
   */
  verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Update user profile
   */
  updateProfile(
    updates: Partial<{
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
      bio?: string;
    }>
  ): void {
    const updatedFields = Object.keys(updates);
    this.props.profile = this.props.profile.update(updates);
    this.props.updatedAt = new Date();
    this.addDomainEvent(new UserProfileUpdatedEvent(this.id, updatedFields));
  }

  /**
   * Record user login
   */
  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Join a workspace
   */
  joinWorkspace(workspaceId: EntityId, role: Role): void {
    // Check if already a member
    const existing = this.props.workspaces.find((m) =>
      m.workspaceId.equals(workspaceId)
    );

    if (existing) {
      throw new Error('User is already a member of this workspace');
    }

    const membership = WorkspaceMembership.create(workspaceId, role);
    this.props.workspaces = [...this.props.workspaces, membership];
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new UserJoinedWorkspaceEvent(this.id, workspaceId, role)
    );
  }

  /**
   * Leave a workspace
   */
  leaveWorkspace(workspaceId: EntityId): void {
    const index = this.props.workspaces.findIndex((m) =>
      m.workspaceId.equals(workspaceId)
    );

    if (index === -1) {
      throw new Error('User is not a member of this workspace');
    }

    // Prevent leaving if owner (must transfer ownership first)
    if (this.props.workspaces[index].isOwner()) {
      throw new Error('Workspace owner must transfer ownership before leaving');
    }

    this.props.workspaces = this.props.workspaces.filter(
      (m) => !m.workspaceId.equals(workspaceId)
    );
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserLeftWorkspaceEvent(this.id, workspaceId));
  }

  /**
   * Change role in a workspace
   */
  changeRoleInWorkspace(workspaceId: EntityId, newRole: Role): void {
    const index = this.props.workspaces.findIndex((m) =>
      m.workspaceId.equals(workspaceId)
    );

    if (index === -1) {
      throw new Error('User is not a member of this workspace');
    }

    const oldRole = this.props.workspaces[index].role;
    this.props.workspaces = [
      ...this.props.workspaces.slice(0, index),
      this.props.workspaces[index].withRole(newRole),
      ...this.props.workspaces.slice(index + 1),
    ];
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new UserRoleChangedEvent(this.id, workspaceId, oldRole, newRole)
    );
  }

  /**
   * Get membership for a specific workspace
   */
  getMembershipFor(workspaceId: EntityId): WorkspaceMembership | undefined {
    return this.props.workspaces.find((m) => m.workspaceId.equals(workspaceId));
  }

  /**
   * Check if user has access to a workspace
   */
  hasAccessTo(workspaceId: EntityId): boolean {
    const membership = this.getMembershipFor(workspaceId);
    return membership ? membership.isActive() : false;
  }

  /**
   * Check if user can edit in a workspace
   */
  canEditIn(workspaceId: EntityId): boolean {
    const membership = this.getMembershipFor(workspaceId);
    return membership ? membership.canEdit() : false;
  }

  /**
   * Check if user can manage a workspace
   */
  canManage(workspaceId: EntityId): boolean {
    const membership = this.getMembershipFor(workspaceId);
    return membership ? membership.canManage() : false;
  }

  /**
   * Check if user owns a workspace
   */
  ownsWorkspace(workspaceId: EntityId): boolean {
    const membership = this.getMembershipFor(workspaceId);
    return membership ? membership.isOwner() : false;
  }

  /**
   * Get all active workspaces
   */
  getActiveWorkspaces(): WorkspaceMembership[] {
    return this.props.workspaces.filter((m) => m.isActive());
  }

  /**
   * Convert to primitives for persistence
   */
  toPrimitives() {
    return {
      id: this.id.toString(),
      email: this.props.email.toString(),
      passwordHash: this.props.passwordHash,
      profile: this.props.profile.toPrimitives(),
      workspaces: this.props.workspaces.map((m) => m.toPrimitives()),
      isEmailVerified: this.props.isEmailVerified,
      lastLoginAt: this.props.lastLoginAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
