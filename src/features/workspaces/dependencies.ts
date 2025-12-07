import { IUserService } from '@/features/users/domain/ports/inbound/iuser.service';
import { CreateWorkspaceUseCase } from './app/usecases/create-workspace.usecase';
import { InviteMemberUseCase } from './app/usecases/invite-member.usecase';
import { MongoWorkspaceRepository } from './infrastructure/adapters/driven/mongo-workspace.repository';
import { WorkspaceServiceAdapter } from './infrastructure/adapters/driver/workspace-service.adapter';
import { WorkspaceController } from './infrastructure/adapters/driver/http/workspace.controller';
import { IWorkspaceService } from './domain/ports/inbound/iworkspace.service';

export type WorkspacesDependencies = {
  workspaceRepository: MongoWorkspaceRepository;
  workspaceService: IWorkspaceService;
  workspaceController: WorkspaceController;
};

export type WorkspacesExternalDeps = {
  userService?: IUserService;
};

// Stub user service for when we need workspace service before users are initialized
const stubUserService: IUserService = {
  register: async () => {
    throw new Error('Not implemented');
  },
  login: async () => {
    throw new Error('Not implemented');
  },
  findById: async () => null,
  findByEmail: async () => null,
  save: async () => {},
};

export function makeWorkspacesDependencies(
  external: WorkspacesExternalDeps = {}
): WorkspacesDependencies {
  const workspaceRepository = new MongoWorkspaceRepository();
  const userService = external.userService || stubUserService;

  const createWorkspaceUseCase = new CreateWorkspaceUseCase(
    workspaceRepository,
    userService
  );

  const inviteMemberUseCase = new InviteMemberUseCase(
    workspaceRepository,
    userService
  );

  const workspaceService = new WorkspaceServiceAdapter(
    createWorkspaceUseCase,
    inviteMemberUseCase
  );

  const workspaceController = new WorkspaceController(workspaceService);

  return {
    workspaceRepository,
    workspaceService,
    workspaceController,
  };
}
