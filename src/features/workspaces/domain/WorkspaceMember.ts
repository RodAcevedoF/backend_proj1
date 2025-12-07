import { ValueObject } from '../../../core/domain/ValueObject';
import { EntityId } from '../../../core/domain/EntityId';

export type WorkspaceMemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface WorkspaceMemberProps {
  userId: EntityId;
  role: WorkspaceMemberRole;
  joinedAt: Date;
  invitedBy?: EntityId;
}

/**
 * Workspace Member Value Object
 * Represents a member within a workspace context
 */
export class WorkspaceMember extends ValueObject<WorkspaceMemberProps> {
  private constructor(props: WorkspaceMemberProps) {
    super(props);
  }

  static create(
    userId: EntityId,
    role: WorkspaceMemberRole,
    invitedBy?: EntityId
  ): WorkspaceMember {
    return new WorkspaceMember({
      userId,
      role,
      joinedAt: new Date(),
      invitedBy,
    });
  }

  static fromPrimitives(data: {
    userId: string;
    role: WorkspaceMemberRole;
    joinedAt: Date;
    invitedBy?: string;
  }): WorkspaceMember {
    return new WorkspaceMember({
      userId: EntityId.from(data.userId),
      role: data.role,
      joinedAt: data.joinedAt,
      invitedBy: data.invitedBy ? EntityId.from(data.invitedBy) : undefined,
    });
  }

  get userId(): EntityId {
    return this.props.userId;
  }

  get role(): WorkspaceMemberRole {
    return this.props.role;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get invitedBy(): EntityId | undefined {
    return this.props.invitedBy;
  }

  /**
   * Check if member can edit resources
   */
  canEdit(): boolean {
    return ['owner', 'admin', 'editor'].includes(this.props.role);
  }

  /**
   * Check if member can manage workspace
   */
  canManage(): boolean {
    return ['owner', 'admin'].includes(this.props.role);
  }

  /**
   * Check if member is owner
   */
  isOwner(): boolean {
    return this.props.role === 'owner';
  }

  /**
   * Change member role
   */
  withRole(newRole: WorkspaceMemberRole): WorkspaceMember {
    return new WorkspaceMember({
      ...this.props,
      role: newRole,
    });
  }

  toPrimitives() {
    return {
      userId: this.props.userId.toString(),
      role: this.props.role,
      joinedAt: this.props.joinedAt,
      invitedBy: this.props.invitedBy?.toString(),
    };
  }
}
