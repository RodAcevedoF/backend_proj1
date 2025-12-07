import { IUserService } from '@/features/users/domain/ports/inbound/IUserService';
import { CreateWorkspaceUseCase } from '@/features/workspaces/app/usecases/create-workspace.usecase';
import { InviteMemberUseCase } from '@/features/workspaces/app/usecases/invite-member.usecase';
import { MongoWorkspaceRepository } from '@/features/workspaces/infrastructure/persistence/MongoWorkspaceRepository';
import { WorkspaceServiceAdapter } from '@/features/workspaces/app/WorkspaceServiceAdapter';
import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/IWorkspaceService';

export type WorkspacesDependencies = {
  workspaceRepository: MongoWorkspaceRepository;
  createWorkspaceUseCase: CreateWorkspaceUseCase;
  inviteMemberUseCase: InviteMemberUseCase;
  workspaceService: IWorkspaceService;
};

export type WorkspacesExternalDeps = {
  userService: IUserService;
};

export function makeWorkspacesDependencies(
  external: WorkspacesExternalDeps
): WorkspacesDependencies {
  const workspaceRepository = new MongoWorkspaceRepository();

  const createWorkspaceUseCase = new CreateWorkspaceUseCase(
    workspaceRepository,
    external.userService
  );

  const inviteMemberUseCase = new InviteMemberUseCase(
    workspaceRepository,
    external.userService
  );

  const workspaceService = new WorkspaceServiceAdapter(createWorkspaceUseCase);

  return {
    workspaceRepository,
    createWorkspaceUseCase,
    inviteMemberUseCase,
    workspaceService,
  };
}
