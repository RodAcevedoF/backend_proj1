import { IPasswordHasher } from '@/core/infrastructure/ports/IPasswordHasher';
import { ITokenService } from '@/core/infrastructure/ports/ITokenService';
import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/IWorkspaceService';
import { RegisterUserUseCase } from '@/features/users/app/usecases/register-user.usecase';
import { LoginUserUseCase } from '@/features/users/app/usecases/login-user.usecase';
import { UserServiceAdapter } from '@/features/users/app/UserServiceAdapter';
import { MongoUserRepository } from '@/features/users/infrastructure/persistence/MongoUserRepository';
import { AuthController } from '@/features/users/infrastructure/http/auth.controller';
import { IUserService } from '@/features/users/domain/ports/inbound/IUserService';

export type UsersDependencies = {
  userRepository: MongoUserRepository;
  userService: IUserService;
  registerUseCase: RegisterUserUseCase;
  loginUseCase: LoginUserUseCase;
  authController: AuthController;
};

export type UsersExternalDeps = {
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
  workspaceService: IWorkspaceService;
};

export function makeUsersDependencies(
  external: UsersExternalDeps
): UsersDependencies {
  const userRepository = new MongoUserRepository();
  const userService = new UserServiceAdapter(userRepository);

  const registerUseCase = new RegisterUserUseCase(
    userRepository,
    external.workspaceService,
    external.passwordHasher
  );

  const loginUseCase = new LoginUserUseCase(
    userRepository,
    external.passwordHasher,
    external.tokenService
  );

  const authController = new AuthController(registerUseCase, loginUseCase);

  return {
    userRepository,
    userService,
    registerUseCase,
    loginUseCase,
    authController,
  };
}
