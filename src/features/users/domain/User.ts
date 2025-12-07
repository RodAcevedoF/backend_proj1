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

export type AuthProvider = 'email' | 'google';

export interface UserProps {
  email: Email;
  passwordHash: string;
  profile: UserProfile;
  workspaces: WorkspaceMembership[];
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  oauthId?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
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
   * Create a new user with email/password
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
      authProvider: 'email',
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
   * Create a new user from OAuth provider
   */
  static createFromOAuth(
    email: Email,
    oauthId: string,
    provider: AuthProvider,
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string }
  ): User {
    const userId = EntityId.create();
    const now = new Date();

    const user = new User(userId, {
      email,
      passwordHash: '', // No password for OAuth users
      profile: UserProfile.create(profile),
      workspaces: [],
      isEmailVerified: true, // OAuth emails are pre-verified
      authProvider: provider,
      oauthId,
      createdAt: now,
      updatedAt: now,
    });

    user.addDomainEvent(
      new UserCreatedEvent(userId, email.toString(), EntityId.create())
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
   * Set email verification token
   */
  setEmailVerificationToken(token: string, expiresInHours: number = 24): void {
    this.props.emailVerificationToken = token;
    this.props.emailVerificationExpires = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000
    );
    this.props.updatedAt = new Date();
  }

  /**
   * Verify email with token
   */
  verifyEmailWithToken(token: string): boolean {
    if (
      this.props.emailVerificationToken !== token ||
      !this.props.emailVerificationExpires ||
      this.props.emailVerificationExpires < new Date()
    ) {
      return false;
    }

    this.props.isEmailVerified = true;
    this.props.emailVerificationToken = undefined;
    this.props.emailVerificationExpires = undefined;
    this.props.updatedAt = new Date();
    return true;
  }

  /**
   * Verify user's email (direct, for OAuth)
   */
  verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
  }

  /**
   * Set password reset token
   */
  setPasswordResetToken(token: string, expiresInHours: number = 1): void {
    this.props.passwordResetToken = token;
    this.props.passwordResetExpires = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000
    );
    this.props.updatedAt = new Date();
  }

  /**
   * Reset password with token
   */
  resetPasswordWithToken(token: string, newPasswordHash: string): boolean {
    if (
      this.props.passwordResetToken !== token ||
      !this.props.passwordResetExpires ||
      this.props.passwordResetExpires < new Date()
    ) {
      return false;
    }

    this.props.passwordHash = newPasswordHash;
    this.props.passwordResetToken = undefined;
    this.props.passwordResetExpires = undefined;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
    return true;
  }

  /**
   * Check if user is OAuth-based
   */
  isOAuthUser(): boolean {
    return this.props.authProvider !== 'email';
  }

  get authProvider(): AuthProvider {
    return this.props.authProvider;
  }

  get oauthId(): string | undefined {
    return this.props.oauthId;
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
      authProvider: this.props.authProvider,
      oauthId: this.props.oauthId,
      emailVerificationToken: this.props.emailVerificationToken,
      emailVerificationExpires: this.props.emailVerificationExpires,
      passwordResetToken: this.props.passwordResetToken,
      passwordResetExpires: this.props.passwordResetExpires,
      lastLoginAt: this.props.lastLoginAt,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
