import { BcryptPasswordHasher } from '@/core/infrastructure/adapters/BcryptPasswordHasher';
import { SessionTokenService } from '@/core/infrastructure/adapters/JwtTokenService';
import { RedisTokenService } from '@/core/infrastructure/adapters/RedisTokenService';
import { NodemailerEmailService } from '@/core/infrastructure/adapters/NodemailerEmailService';
import { SupabaseOAuthProvider } from '@/core/infrastructure/adapters/SupabaseOAuthProvider';
import { ITokenService } from '@/core/domain/ports/ITokenService';
import { IEmailService } from '@/core/domain/ports/IEmailService';
import { IOAuthProvider } from '@/core/domain/ports/IOAuthProvider';
import {
  makeUsersDependencies,
  UsersDependencies,
} from '@/features/users/dependencies';
import {
  makeWorkspacesDependencies,
  WorkspacesDependencies,
} from '@/features/workspaces/dependencies';
import {
  makeRoadmapDependencies,
  RoadmapDependencies,
} from '@/features/roadmap/dependencies';
import {
  makeArticleDependencies,
  ArticleDependencies,
} from '@/features/article/dependencies';
import {
  makeCategoryDependencies,
  CategoryDependencies,
} from '@/features/category/dependencies';
import {
  makeResourceDependencies,
  ResourceDependencies,
} from '@/features/resource/dependencies';

export type AppConfig = {
  sessionDurationHours?: number;
  bcryptSaltRounds?: number;
  redisUrl?: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  supabase?: {
    url: string;
    anonKey: string;
  };
  appUrl?: string;
  frontendUrl?: string;
};

export type AppDependencies = {
  users: UsersDependencies;
  workspaces: WorkspacesDependencies;
  roadmaps: RoadmapDependencies;
  articles: ArticleDependencies;
  categories: CategoryDependencies;
  resources: ResourceDependencies;
  shared: {
    passwordHasher: BcryptPasswordHasher;
    tokenService: ITokenService;
    emailService: IEmailService;
    oauthProvider: IOAuthProvider;
  };
};

// Stub implementations for when services are not configured
const stubEmailService: IEmailService = {
  send: async () => console.warn('Email service not configured'),
  sendVerificationEmail: async () => console.warn('Email service not configured'),
  sendPasswordResetEmail: async () => console.warn('Email service not configured'),
};

const stubOAuthProvider: IOAuthProvider = {
  getAuthUrl: () => {
    throw new Error('OAuth not configured');
  },
  handleCallback: async () => {
    throw new Error('OAuth not configured');
  },
  verifyToken: async () => null,
  refreshTokens: async () => {
    throw new Error('OAuth not configured');
  },
};

/**
 * Bootstrap application dependencies
 * Resolves circular dependencies between features
 */
export function bootstrap(config: AppConfig = {}): AppDependencies {
  const appUrl = config.appUrl || process.env.APP_URL || 'http://localhost:3000';
  const frontendUrl = config.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

  // 1. Shared infrastructure
  const passwordHasher = new BcryptPasswordHasher(config.bcryptSaltRounds);
  const tokenService: ITokenService = config.redisUrl
    ? new RedisTokenService(config.redisUrl, config.sessionDurationHours || 24)
    : new SessionTokenService(config.sessionDurationHours || 24);

  // Email service (optional - uses stub if not configured)
  const emailService: IEmailService = config.smtp
    ? new NodemailerEmailService(config.smtp, appUrl)
    : stubEmailService;

  // OAuth provider (optional - uses stub if not configured)
  const oauthProvider: IOAuthProvider = config.supabase
    ? new SupabaseOAuthProvider(config.supabase)
    : stubOAuthProvider;

  // 2. Articles (self-contained, no external deps)
  const articles = makeArticleDependencies();

  // 3. Categories (self-contained)
  const categories = makeCategoryDependencies();

  // 4. Users first (create without workspace service initially)
  const users = makeUsersDependencies({
    passwordHasher,
    tokenService,
    emailService,
    oauthProvider,
    frontendUrl,
  });

  // 5. Workspaces (needs userService for creating workspaces)
  const workspaces = makeWorkspacesDependencies({
    userService: users.userService,
  });

  // 6. Roadmaps need article repository
  const roadmaps = makeRoadmapDependencies({
    articleRepository: articles.articleRepository,
  });

  // 7. Resources (self-contained)
  const resources = makeResourceDependencies();

  return {
    users,
    workspaces,
    roadmaps,
    articles,
    categories,
    resources,
    shared: {
      passwordHasher,
      tokenService,
      emailService,
      oauthProvider,
    },
  };
}
