import { IPasswordHasher } from '@/core/domain/ports/IPasswordHasher';
import { ITokenService } from '@/core/domain/ports/ITokenService';
import { IEmailService } from '@/core/domain/ports/IEmailService';
import { IOAuthProvider } from '@/core/domain/ports/IOAuthProvider';
import { IWorkspaceService } from '@/features/workspaces/domain/ports/inbound/iworkspace.service';
import { RegisterUserUseCase } from './app/usecases/register-user.usecase';
import { LoginUserUseCase } from './app/usecases/login-user.usecase';
import { VerifyEmailUseCase } from './app/usecases/verify-email.usecase';
import { SendVerificationEmailUseCase } from './app/usecases/send-verification-email.usecase';
import { GoogleAuthUseCase } from './app/usecases/google-auth.usecase';
import { RequestPasswordResetUseCase } from './app/usecases/request-password-reset.usecase';
import { ResetPasswordUseCase } from './app/usecases/reset-password.usecase';
import { UserServiceAdapter } from './infrastructure/adapters/driver/user-service.adapter';
import { MongoUserRepository } from './infrastructure/adapters/driven/persistence/mongo.repository';
import { AuthController } from './infrastructure/adapters/driver/http/auth.controller';
import { IUserService } from './domain/ports/inbound/iuser.service';

export type UsersDependencies = {
  userRepository: MongoUserRepository;
  userService: IUserService;
  authController: AuthController;
  verifyEmailUseCase: VerifyEmailUseCase;
  sendVerificationEmailUseCase: SendVerificationEmailUseCase;
  googleAuthUseCase: GoogleAuthUseCase;
  requestPasswordResetUseCase: RequestPasswordResetUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
};

export type UsersExternalDeps = {
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
  emailService: IEmailService;
  oauthProvider: IOAuthProvider;
  workspaceService?: IWorkspaceService;
  frontendUrl: string;
};

export function makeUsersDependencies(
  external: UsersExternalDeps
): UsersDependencies {
  const userRepository = new MongoUserRepository();

  const registerUseCase = new RegisterUserUseCase(
    userRepository,
    external.workspaceService,
    external.passwordHasher,
    external.emailService,
    external.frontendUrl
  );

  const loginUseCase = new LoginUserUseCase(
    userRepository,
    external.passwordHasher,
    external.tokenService
  );

  const verifyEmailUseCase = new VerifyEmailUseCase(userRepository);

  const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(
    userRepository,
    external.emailService,
    external.frontendUrl
  );

  const googleAuthUseCase = new GoogleAuthUseCase(
    userRepository,
    external.oauthProvider,
    external.tokenService
  );

  const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
    userRepository,
    external.emailService,
    external.frontendUrl
  );

  const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    external.passwordHasher
  );

  const userService = new UserServiceAdapter(
    userRepository,
    registerUseCase,
    loginUseCase
  );

  const authController = new AuthController(
    userService,
    verifyEmailUseCase,
    sendVerificationEmailUseCase,
    googleAuthUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    external.oauthProvider,
    external.tokenService,
    external.frontendUrl
  );

  return {
    userRepository,
    userService,
    authController,
    verifyEmailUseCase,
    sendVerificationEmailUseCase,
    googleAuthUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
  };
}
