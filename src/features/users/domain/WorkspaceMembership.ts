import { ValueObject } from '../../../core/domain/ValueObject';
import { EntityId } from '../../../core/domain/EntityId';
import { DateRange } from '../../../core/domain/DateRange';
import {
  Role,
  canEdit as roleCanEdit,
  canManage as roleCanManage,
  isOwner as roleIsOwner,
} from '../../../core/domain/Role';

export { Role };

interface WorkspaceMembershipProps {
  workspaceId: EntityId;
  role: Role;
  joinedAt: Date;
  membership?: DateRange; // For temporary access
}

/**
 * Workspace Membership Value Object
 * Represents a user's role and access within a specific workspace
 */
export class WorkspaceMembership extends ValueObject<WorkspaceMembershipProps> {
  private constructor(props: WorkspaceMembershipProps) {
    super(props);
  }

  static create(
    workspaceId: EntityId,
    role: Role,
    joinedAt: Date = new Date(),
    membership?: DateRange
  ): WorkspaceMembership {
    return new WorkspaceMembership({
      workspaceId,
      role,
      joinedAt,
      membership,
    });
  }

  static fromPrimitives(data: {
    workspaceId: string;
    role: Role;
    joinedAt: Date;
    membershipStart?: Date;
    membershipEnd?: Date;
  }): WorkspaceMembership {
    return new WorkspaceMembership({
      workspaceId: EntityId.from(data.workspaceId),
      role: data.role,
      joinedAt: data.joinedAt,
      membership: data.membershipStart
        ? DateRange.create(data.membershipStart, data.membershipEnd)
        : undefined,
    });
  }

  get workspaceId(): EntityId {
    return this.props.workspaceId;
  }

  get role(): Role {
    return this.props.role;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get membership(): DateRange | undefined {
    return this.props.membership;
  }

  /**
   * Check if user has active access to the workspace
   */
  isActive(): boolean {
    if (!this.props.membership) return true; // Permanent access
    return this.props.membership.isActive();
  }

  /**
   * Check if user can edit resources in the workspace
   */
  canEdit(): boolean {
    return this.isActive() && roleCanEdit(this.props.role);
  }

  /**
   * Check if user can manage workspace settings
   */
  canManage(): boolean {
    return this.isActive() && roleCanManage(this.props.role);
  }

  /**
   * Check if user is the workspace owner
   */
  isOwner(): boolean {
    return this.isActive() && roleIsOwner(this.props.role);
  }

  /**
   * Change the role of this membership
   */
  withRole(newRole: Role): WorkspaceMembership {
    return new WorkspaceMembership({
      ...this.props,
      role: newRole,
    });
  }

  /**
   * Update membership period
   */
  withMembership(membership?: DateRange): WorkspaceMembership {
    return new WorkspaceMembership({
      ...this.props,
      membership,
    });
  }

  toPrimitives() {
    return {
      workspaceId: this.props.workspaceId.toString(),
      role: this.props.role,
      joinedAt: this.props.joinedAt,
      membershipStart: this.props.membership?.start,
      membershipEnd: this.props.membership?.end,
    };
  }
}
