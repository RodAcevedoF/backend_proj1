import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

/**
 * Validation Middleware
 * Validates request body against Zod schema
 *
 * Follows Single Responsibility: Only validates input
 */
export function validateRequest<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and transform request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: errors,
        });
      }

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
      });
    }
  };
}

/**
 * Validate request params
 */
export function validateParams<T extends Record<string, string>>(
  schema: ZodType<T>
) {
  return (req: Request<T>, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid URL parameters',
          details: errors,
        });
      }

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid URL parameters',
      });
    }
  };
}

/**
 * Validate request query
 */
export function validateQuery<T extends Record<string, string>>(
  schema: ZodType<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid query parameters',
          details: errors,
        });
      }

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
      });
    }
  };
}
