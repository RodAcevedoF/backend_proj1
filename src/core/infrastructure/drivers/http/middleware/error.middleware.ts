import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(403, message);
  }

  static notFound(message: string = 'Not found'): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(500, message, false);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The provided ID is not valid',
    });
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'A record with this value already exists',
    });
  }

  console.error('Unexpected error:', err);

  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred';

  return res.status(500).json({
    error: 'Internal Server Error',
    message,
  });
}
