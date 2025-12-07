import { BaseDomainEvent } from '../../../core/domain/DomainEvent';
import { EntityId } from '../../../core/domain/EntityId';

/**
 * User Created Event
 */
export class UserCreatedEvent extends BaseDomainEvent {
  static readonly eventName = 'user.created';

  constructor(
    public readonly userId: EntityId,
    public readonly email: string,
    public readonly workspaceId: EntityId
  ) {
    super(userId.toString(), UserCreatedEvent.eventName);
  }
}

/**
 * User Joined Workspace Event
 */
export class UserJoinedWorkspaceEvent extends BaseDomainEvent {
  static readonly eventName = 'user.joined_workspace';

  constructor(
    public readonly userId: EntityId,
    public readonly workspaceId: EntityId,
    public readonly role: string
  ) {
    super(userId.toString(), UserJoinedWorkspaceEvent.eventName);
  }
}

/**
 * User Left Workspace Event
 */
export class UserLeftWorkspaceEvent extends BaseDomainEvent {
  static readonly eventName = 'user.left_workspace';

  constructor(
    public readonly userId: EntityId,
    public readonly workspaceId: EntityId
  ) {
    super(userId.toString(), UserLeftWorkspaceEvent.eventName);
  }
}

/**
 * User Role Changed Event
 */
export class UserRoleChangedEvent extends BaseDomainEvent {
  static readonly eventName = 'user.role_changed';

  constructor(
    public readonly userId: EntityId,
    public readonly workspaceId: EntityId,
    public readonly oldRole: string,
    public readonly newRole: string
  ) {
    super(userId.toString(), UserRoleChangedEvent.eventName);
  }
}

/**
 * User Profile Updated Event
 */
export class UserProfileUpdatedEvent extends BaseDomainEvent {
  static readonly eventName = 'user.profile_updated';

  constructor(
    public readonly userId: EntityId,
    public readonly updatedFields: string[]
  ) {
    super(userId.toString(), UserProfileUpdatedEvent.eventName);
  }
}

/**
 * User Password Changed Event
 */
export class UserPasswordChangedEvent extends BaseDomainEvent {
  static readonly eventName = 'user.password_changed';

  constructor(public readonly userId: EntityId) {
    super(userId.toString(), UserPasswordChangedEvent.eventName);
  }
}
