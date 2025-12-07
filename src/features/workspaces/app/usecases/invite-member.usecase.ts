import { IWorkspaceRepository } from '@/features/workspaces/domain/ports/outbound/iworkspace.repository';
import { IUserService } from '@/features/users/domain/ports/inbound/iuser.service';
import { EntityId, Email, Result } from '@/core/domain';
import { InviteMemberDto } from '@/features/workspaces/app/dtos/workspace.dto';

/**
 * Invite Member Use Case
 * Invites a user to join a workspace
 */
export class InviteMemberUseCase {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly userService: IUserService
  ) {}

  async execute(
    workspaceId: EntityId,
    dto: InviteMemberDto,
    invitedById: EntityId
  ): Promise<Result<void>> {
    // Get workspace
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      return Result.fail('Workspace not found');
    }

    // Check if inviter can manage workspace
    if (!workspace.canManage(invitedById)) {
      return Result.fail('Insufficient permissions');
    }

    // Find user by email
    const email = Email.create(dto.email);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return Result.fail('User not found');
    }

    // Check if user is already a member
    if (workspace.isMember(user.id)) {
      return Result.fail('User is already a member');
    }

    // Add member to workspace
    try {
      workspace.addMember(user.id, dto.role, invitedById);
      await this.workspaceRepository.save(workspace);

      // Add workspace to user's memberships
      user.joinWorkspace(workspaceId, dto.role);
      await this.userService.save(user);

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Failed to invite member'
      );
    }
  }
}
