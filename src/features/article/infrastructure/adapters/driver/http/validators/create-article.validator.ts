import { z } from 'zod';

export const CreateArticleSchema = z.object({
  title: z.string().min(1, 'title is required'),
  content: z.string().min(1, 'content is required'),
  workspaceId: z.string().min(1, 'workspaceId is required').optional(),
  userId: z.string().min(1, 'userId is required').optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
