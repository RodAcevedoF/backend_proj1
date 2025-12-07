import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@/features/users/app/usecases/register-user.usecase';
import { LoginUserUseCase } from '@/features/users/app/usecases/login-user.usecase';
import {
  RegisterUserDto,
  LoginUserDto,
} from '@/features/users/app/dtos/user.dto';

/**
 * Auth Controller
 * Handles HTTP requests for authentication
 *
 * Follows Single Responsibility: Only handles HTTP request/response
 * Delegates business logic to use cases
 */
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  /**
   * POST /auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const dto: RegisterUserDto = req.body;

      // Validate required fields
      if (!dto.email || !dto.password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email and password are required',
        });
      }

      // Execute use case
      const result = await this.registerUserUseCase.execute(dto);

      if (result.isFailure) {
        return res.status(400).json({
          error: 'Bad Request',
          message: result.getError(),
        });
      }

      const user = result.getValue();

      return res.status(201).json({
        message: 'User registered successfully',
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

  /**
   * POST /auth/login
   * Authenticate user and return tokens
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const dto: LoginUserDto = req.body;

      // Validate required fields
      if (!dto.email || !dto.password) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Email and password are required',
        });
      }

      // Execute use case
      const result = await this.loginUserUseCase.execute(dto);

      if (result.isFailure) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: result.getError(),
        });
      }

      const authData = result.getValue();

      // Set session cookie (HTTP-only, Secure, SameSite)
      res.cookie('sessionId', authData.sessionId, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });

      return res.status(200).json({
        message: 'Login successful',
        data: {
          user: authData.user,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to login',
      });
    }
  }
}
