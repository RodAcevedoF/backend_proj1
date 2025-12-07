import { Request, Response } from 'express';
import { IUserService } from '@/features/users/domain/ports/inbound/iuser.service';
import { ITokenService } from '@/core/domain/ports/ITokenService';
import { IOAuthProvider } from '@/core/domain/ports/IOAuthProvider';
import { VerifyEmailUseCase } from '@/features/users/app/usecases/verify-email.usecase';
import { SendVerificationEmailUseCase } from '@/features/users/app/usecases/send-verification-email.usecase';
import { GoogleAuthUseCase } from '@/features/users/app/usecases/google-auth.usecase';
import { RequestPasswordResetUseCase } from '@/features/users/app/usecases/request-password-reset.usecase';
import { ResetPasswordUseCase } from '@/features/users/app/usecases/reset-password.usecase';
import { RegisterUserDto, LoginUserDto } from '@/features/users/app/dtos/user.dto';
import { Email } from '@/core/domain';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
export class AuthController {
  constructor(
    private readonly userService: IUserService,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly oauthProvider: IOAuthProvider,
    private readonly tokenService: ITokenService,
    private readonly frontendUrl: string
  ) {}

  private setCookie(res: Response, sessionId: string): void {
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const dto: RegisterUserDto = req.body;

      if (!dto.email || !dto.password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email and password are required',
        });
      }

      const result = await this.userService.register(dto);

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      const user = result.getValue();

      return res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          id: user.id.toString(),
          email: user.email.toString(),
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to register user',
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const dto: LoginUserDto = req.body;

      if (!dto.email || !dto.password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email and password are required',
        });
      }

      const result = await this.userService.login(dto);

      if (result.isFailure) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: result.getError(),
        });
      }

      const authData = result.getValue();
      this.setCookie(res, authData.sessionId);

      return res.status(200).json({
        message: 'Login successful',
        data: { user: authData.user },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to login',
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<Response | void> {
    try {
      const { token, redirect } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Verification token is required',
        });
      }

      const result = await this.verifyEmailUseCase.execute({ token });

      if (result.isFailure) {
        // Redirect to frontend with error
        const redirectUrl = typeof redirect === 'string' ? redirect : this.frontendUrl;
        return res.redirect(`${redirectUrl}?error=invalid_token`);
      }

      // Redirect to frontend success page
      const redirectUrl = typeof redirect === 'string' ? redirect : this.frontendUrl;
      return res.redirect(`${redirectUrl}?verified=true`);
    } catch (error) {
      console.error('Verify email error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify email',
      });
    }
  }

  async resendVerification(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email is required',
        });
      }

      const emailVO = Email.create(email);
      await this.sendVerificationEmailUseCase.execute(emailVO);

      // Always return success to not reveal if email exists
      return res.status(200).json({
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to resend verification email',
      });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const callbackUrl = `${req.protocol}://${req.get('host')}/sagepoint/api/v1/auth/google/callback`;
    const authUrl = this.oauthProvider.getAuthUrl(callbackUrl);
    res.redirect(authUrl);
  }

  async googleCallback(req: Request, res: Response): Promise<Response | void> {
    try {
      const { code, error } = req.query;

      if (error || !code || typeof code !== 'string') {
        return res.redirect(`${this.frontendUrl}/auth/login?error=oauth_failed`);
      }

      const result = await this.googleAuthUseCase.execute(code);

      if (result.isFailure) {
        return res.redirect(`${this.frontendUrl}/auth/login?error=oauth_failed`);
      }

      const authData = result.getValue();
      this.setCookie(res, authData.sessionId);

      // Redirect to frontend dashboard
      return res.redirect(`${this.frontendUrl}/dashboard`);
    } catch (error) {
      console.error('Google callback error:', error);
      return res.redirect(`${this.frontendUrl}/auth/login?error=oauth_failed`);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email is required',
        });
      }

      const emailVO = Email.create(email);
      await this.requestPasswordResetUseCase.execute(emailVO);

      // Always return success to not reveal if email exists
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process password reset request',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Token and new password are required',
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Password must be at least 8 characters',
        });
      }

      const result = await this.resetPasswordUseCase.execute({ token, newPassword });

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      return res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to reset password',
      });
    }
  }
}
