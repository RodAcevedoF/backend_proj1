import { RequestHandler } from 'express';
import z from 'zod';

export const validateBody =
  (schema: z.ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({
          error: 'Invalid payload',
          details: z.treeifyError(result.error),
        });
    }
    req.body = result.data;
    next();
  };
