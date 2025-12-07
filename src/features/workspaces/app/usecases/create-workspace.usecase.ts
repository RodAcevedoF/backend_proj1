import { IWorkspaceRepository } from '@/features/workspaces/domain/ports/outbound/iworkspace.repository';
import { IUserService } from '@/features/users/domain/ports/inbound/iuser.service';
import { Workspace } from '@/features/workspaces/domain/workspace';
import { EntityId, Result } from '@/core/domain';
import { CreateWorkspaceDto } from '@/features/workspaces/app/dtos/workspace.dto';

/**
 * Create Workspace Use Case
 * Creates a new workspace with the current user as owner
 */
export class CreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: IWorkspaceRepository,
    private readonly userService: IUserService
  ) {}

  async execute(
    dto: CreateWorkspaceDto,
    userId: EntityId
  ): Promise<Result<Workspace>> {
    // Verify user exists
    const user = await this.userService.findById(userId);
    if (!user) {
      return Result.fail('User not found');
    }

    // Create workspace
    const workspace = Workspace.create(dto.name, userId, dto.description);

    // Save workspace
    await this.workspaceRepository.save(workspace);

    // Add workspace to user's memberships
    user.joinWorkspace(workspace.id, 'owner');
    await this.userService.save(user);

    return Result.ok(workspace);
  }
}
