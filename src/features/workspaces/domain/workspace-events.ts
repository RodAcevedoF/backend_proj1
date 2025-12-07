import { BaseDomainEvent } from '@/core/domain/DomainEvent';
import { EntityId } from '@/core/domain/EntityId';

/**
 * Workspace Created Event
 */
export class WorkspaceCreatedEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.created';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly name: string,
    public readonly ownerId: EntityId
  ) {
    super(workspaceId.toString(), WorkspaceCreatedEvent.eventName);
  }
}

/**
 * Member Added to Workspace Event
 */
export class MemberAddedEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.member_added';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly userId: EntityId,
    public readonly role: string,
    public readonly invitedBy?: EntityId
  ) {
    super(workspaceId.toString(), MemberAddedEvent.eventName);
  }
}

/**
 * Member Removed from Workspace Event
 */
export class MemberRemovedEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.member_removed';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly userId: EntityId,
    public readonly removedBy?: EntityId
  ) {
    super(workspaceId.toString(), MemberRemovedEvent.eventName);
  }
}

/**
 * Member Role Changed Event
 */
export class MemberRoleChangedEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.member_role_changed';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly userId: EntityId,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy?: EntityId
  ) {
    super(workspaceId.toString(), MemberRoleChangedEvent.eventName);
  }
}

/**
 * Workspace Updated Event
 */
export class WorkspaceUpdatedEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.updated';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly updatedFields: string[]
  ) {
    super(workspaceId.toString(), WorkspaceUpdatedEvent.eventName);
  }
}

/**
 * Workspace Settings Updated Event
 */
export class WorkspaceSettingsUpdatedEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.settings_updated';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly updatedBy: EntityId
  ) {
    super(workspaceId.toString(), WorkspaceSettingsUpdatedEvent.eventName);
  }
}

/**
 * Ownership Transferred Event
 */
export class OwnershipTransferredEvent extends BaseDomainEvent {
  static readonly eventName = 'workspace.ownership_transferred';

  constructor(
    public readonly workspaceId: EntityId,
    public readonly fromUserId: EntityId,
    public readonly toUserId: EntityId
  ) {
    super(workspaceId.toString(), OwnershipTransferredEvent.eventName);
  }
}
