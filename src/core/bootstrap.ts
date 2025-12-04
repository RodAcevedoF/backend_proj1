import { BcryptPasswordHasher } from '@/core/infrastructure/adapters/BcryptPasswordHasher';
import { SessionTokenService } from '@/core/infrastructure/adapters/JwtTokenService';
import { RedisTokenService } from '@/core/infrastructure/adapters/RedisTokenService';
import { ITokenService } from '@/core/infrastructure/ports/ITokenService';
import { makeUsersDependencies, UsersDependencies } from '@/features/users/dependencies';
import { makeWorkspacesDependencies, WorkspacesDependencies } from '@/features/workspaces/dependencies';
import { makeRoadmapDependencies, RoadmapDependencies } from '@/features/roadmap/dependencies';
import { makeArticleDependencies } from '@/features/article/dependencies';
import { MongoUserRepository } from '@/features/users/infrastructure/persistence/MongoUserRepository';
import { MongoWorkspaceRepository } from '@/features/workspaces/infrastructure/persistence/MongoWorkspaceRepository';
import { UserServiceAdapter } from '@/features/users/app/UserServiceAdapter';
import { WorkspaceServiceAdapter } from '@/features/workspaces/app/WorkspaceServiceAdapter';
import { CreateWorkspaceUseCase } from '@/features/workspaces/app/usecases/create-workspace.usecase';

export type AppConfig = {
  sessionDurationHours?: number;
  bcryptSaltRounds?: number;
  redisUrl?: string;
};

export type AppDependencies = {
  users: UsersDependencies;
  workspaces: WorkspacesDependencies;
  roadmaps: RoadmapDependencies;
  shared: {
    passwordHasher: BcryptPasswordHasher;
    tokenService: ITokenService;
  };
};

/**
 * Bootstrap application dependencies
 * Resolves circular dependencies between features
 */
export function bootstrap(config: AppConfig = {}): AppDependencies {
  // 1. Shared infrastructure
  const passwordHasher = new BcryptPasswordHasher(config.bcryptSaltRounds);
  const tokenService: ITokenService = config.redisUrl
    ? new RedisTokenService(config.redisUrl, config.sessionDurationHours || 24)
    : new SessionTokenService(config.sessionDurationHours || 24);

  // 2. Create repositories first (no dependencies)
  const userRepository = new MongoUserRepository();
  const workspaceRepository = new MongoWorkspaceRepository();

  // 3. Create service adapters (depend only on repos)
  const userService = new UserServiceAdapter(userRepository);

  // 4. Create workspace use cases (need userService)
  const createWorkspaceUseCase = new CreateWorkspaceUseCase(
    workspaceRepository,
    userService
  );
  const workspaceService = new WorkspaceServiceAdapter(createWorkspaceUseCase);

  // 5. Feature dependencies
  const users = makeUsersDependencies({
    passwordHasher,
    tokenService,
    workspaceService,
  });

  const workspaces = makeWorkspacesDependencies({
    userService,
  });

  // Article is self-contained, roadmap needs article repo
  const articleDeps = makeArticleDependencies();
  const roadmaps = makeRoadmapDependencies({
    articleRepository: articleDeps.articleRepository,
  });

  return {
    users,
    workspaces,
    roadmaps,
    shared: {
      passwordHasher,
      tokenService,
    },
  };
}
