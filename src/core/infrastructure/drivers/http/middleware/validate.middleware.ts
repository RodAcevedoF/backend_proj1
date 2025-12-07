import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';

/**
 * Validate request body against Zod schema
 */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: formatZodErrors(result.error),
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request params against Zod schema
 */
export function validateParams<T extends Record<string, string>>(
  schema: ZodType<T>
) {
  return (req: Request<T>, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid URL parameters',
        details: formatZodErrors(result.error),
      });
    }
    req.params = result.data;
    next();
  };
}

/**
 * Validate request query against Zod schema
 */
export function validateQuery<T extends Record<string, string>>(
  schema: ZodType<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: formatZodErrors(result.error),
      });
    }
    req.query = result.data as any;
    next();
  };
}

function formatZodErrors(error: ZodError) {
  return error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
}
